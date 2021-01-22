/* eslint-disable no-param-reassign */
import { reaction } from 'mobx';
import {
  getParent, getType, Instance, resolveIdentifier, SnapshotIn, types,
} from 'mobx-state-tree';
import {
  chunk, debounce, flatten, range,
} from 'lodash';

import { polyhedra } from '../data/polyhedra';
import {
  CM_TO_PIXELS_RATIO, degToRad,
  getTextureTransformMatrix, hingedPlot, hingedPlotByProjectionDistance,
  offsetPolygonPoints,
  polygonPointsGivenAnglesAndSides, radToDeg,
  RawPoint,
  scalePoint,
  triangleAnglesGivenSides,
} from '../../common/util/geom';
import { EVENTS } from '../../../main/ipc';
import { closedPolygonPath, roundedEdgePath } from '../util/shapes/generic';
import { ascendantEdgeConnectionTabs, AscendantEdgeTabsModel } from '../util/shapes/ascendantEdgeConnectionTabs';
import { baseEdgeConnectionTab, BaseEdgeTabsModel } from '../util/shapes/baseEdgeConnectionTab';
import { DashPatternModel, strokeDashPath } from '../util/shapes/strokeDashPath';
import { boundingViewBoxAttrs } from '../../../common/util/svg';
import { StrokeDashPathPatternModel } from '../data/dash-patterns';
import { DimensionsModel } from '../../TextureTransformEditor/models/DimensionsModel';
import { getBoundedTexturePathD } from '../../common/util/path-boolean';
import { PathData } from '../util/PathData';

const FACE_FIRST_EDGE_NORMALIZED_SIZE = 1000;

export const PathFaceDecorationPatternModel = types.model({
  pathD: types.string,
  sourceFileName: types.string,
  isPositive: types.boolean,
});

export interface IPathFaceDecorationPatternModel extends Instance<typeof PathFaceDecorationPatternModel> {}

export const ImageFaceDecorationPatternModel = types.model({
  imageData: types.string,
  dimensions: DimensionsModel,
  sourceFileName: types.string,
});
export interface IImageFaceDecorationPatternModel extends Instance<typeof ImageFaceDecorationPatternModel> {}

// from texture editor
export const TextureFaceDecorationModel = types.model({
  pattern: types.union(PathFaceDecorationPatternModel, ImageFaceDecorationPatternModel),
  transformOrigin: types.frozen<RawPoint>(),
  translate: types.frozen<RawPoint>(),
  rotate: types.number,
  scale: types.number,
}).views((self) => ({
  get transformMatrix() {
    const {
      transformOrigin, rotate, scale, translate,
    } = self;
    return getTextureTransformMatrix(transformOrigin, scale, rotate, translate);
  },
}));
export interface ITextureFaceDecorationModel extends Instance<typeof TextureFaceDecorationModel> {}

// from file menu template upload
const RawFaceDecorationModel = types.model({
  dValue: types.string,
});
export interface IRawFaceDecorationModel extends Instance<typeof RawFaceDecorationModel> {}

export const FaceDecorationModel = types.union(TextureFaceDecorationModel, RawFaceDecorationModel);

export const PyramidModel = types.model({
  shapeName: types.string,
}).views((self) => ({
  get geometry() {
    return polyhedra[self.shapeName];
  },
}));

export const defaultStrokeDashSpec = {
  strokeDashPathPattern: '● 1 ○ 2',
  strokeDashLength: 11,
  strokeDashOffsetRatio: 0,
};

export const PyramidNetModel = types.model({
  pyramid: PyramidModel,
  ascendantEdgeTabsSpec: types.late(() => AscendantEdgeTabsModel),
  baseEdgeTabsSpec: types.late(() => BaseEdgeTabsModel),
  shapeHeightInCm: types.number,
  faceDecoration: types.maybe(types.late(() => FaceDecorationModel)),
  useDottedStroke: types.boolean,
  useClones: types.optional(types.boolean, false),
  baseScoreDashSpec: types.maybe(types.late(() => DashPatternModel)),
  interFaceScoreDashSpec: types.maybe(types.late(() => DashPatternModel)),
  // in this case of faceDecoration being defined, this is a derived value thus could be made volatile
  // however, it needs to be persisted in the model because
  // it can also be defined by cut hole path import via templated svg file
})
  .views((self) => ({
    get tabIntervalRatios() {
      const {
        tabsCount, tabStartGapToTabDepth, tabDepthToTraversalLength, holeWidthRatio,
      } = self.ascendantEdgeTabsSpec;
      const offsetRatio = tabDepthToTraversalLength * tabStartGapToTabDepth;
      const intervalRatio = (1 - offsetRatio) / tabsCount;
      const tabWidthRatio = intervalRatio * holeWidthRatio;
      return range(tabsCount)
        .map((index) => [
          offsetRatio + index * intervalRatio,
          offsetRatio + index * intervalRatio + tabWidthRatio,
        ]);
    },

    get tabGapIntervalRatios() {
      return chunk([0, ...flatten(this.tabIntervalRatios), 1], 2);
    },

    get faceEdgeNormalizer() {
      return FACE_FIRST_EDGE_NORMALIZED_SIZE / self.pyramid.geometry.relativeFaceEdgeLengths[0];
    },

    get normalizedFaceEdgeLengths() {
      return self.pyramid.geometry.relativeFaceEdgeLengths.map(
        // @ts-ignore
        (val) => val * self.faceEdgeNormalizer,
      );
    },

    get faceInteriorAngles(): number[] {
      return triangleAnglesGivenSides(this.normalizedFaceEdgeLengths);
    },

    get faceBoundaryPoints() {
      return polygonPointsGivenAnglesAndSides(this.faceInteriorAngles, this.actualFaceEdgeLengths);
    },

    get normalizedDecorationBoundaryPoints():RawPoint[] {
      return polygonPointsGivenAnglesAndSides(
        this.faceInteriorAngles,
        this.normalizedFaceEdgeLengths,
      );
    },

    // factor to scale face lengths such that the first edge will be equal to 1
    get faceLengthAdjustRatio() {
      const { shapeHeightInCm } = self;
      const { relativeFaceEdgeLengths, diameter } = self.pyramid.geometry;
      const baseEdgeLengthToShapeHeight = diameter / relativeFaceEdgeLengths[1];
      const heightInPixels = CM_TO_PIXELS_RATIO * shapeHeightInCm;
      const desiredFirstLength = heightInPixels / baseEdgeLengthToShapeHeight;
      return desiredFirstLength / this.normalizedFaceEdgeLengths[0];
    },

    get actualFaceEdgeLengths() {
      return this.normalizedFaceEdgeLengths.map((len) => len * this.faceLengthAdjustRatio);
    },

    get ascendantEdgeTabDepth() {
      const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = self;
      return this.actualFaceEdgeLengths[0] * tabDepthToTraversalLength;
    },

    get borderToInsetRatio() {
      const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
      return boundingViewBoxAttrs(closedPolygonPath(this.faceBoundaryPoints).getD()).width
        / boundingViewBoxAttrs(closedPolygonPath(insetPolygonPoints).getD()).width;
    },

    get insetToBorderOffset() {
      const normalizedInsetPoints = offsetPolygonPoints(
        this.normalizedDecorationBoundaryPoints,
        -this.ascendantEdgeTabDepth / this.faceLengthAdjustRatio,
      );
      return scalePoint(normalizedInsetPoints[0], -this.borderToInsetRatio);
    },

    get faceTabFenceposts() {
      const {
        pyramid: {
          geometry: { faceCount },
        },
      } = self;
      const { faceBoundaryPoints, faceInteriorAngles, actualFaceEdgeLengths } = this;
      return range(faceCount + 1).map(
        (index) => hingedPlot(
          faceBoundaryPoints[1], faceBoundaryPoints[0], Math.PI * 2 - index * faceInteriorAngles[2],
          index % 2 ? actualFaceEdgeLengths[2] : actualFaceEdgeLengths[0],
        ),
      );
    },
    get masterBaseTab() {
      return baseEdgeConnectionTab(
        this.faceBoundaryPoints[1], this.faceBoundaryPoints[2],
        this.ascendantEdgeTabDepth, self.baseEdgeTabsSpec, self.baseScoreDashSpec,
      );
    },

    get femaleAscendantFlap() {
      // female tab outer flap
      const remainderGapAngle = 2 * Math.PI - this.faceInteriorAngles[2] * self.pyramid.geometry.faceCount;
      if (remainderGapAngle < 0) {
        throw new Error('too many faces: the sum of angles at apex is greater than 360 degrees');
      }
      const FLAP_APEX_IMPINGE_MARGIN = Math.PI / 12;
      const FLAP_BASE_ANGLE = degToRad(60);

      const flapApexAngle = Math.min(remainderGapAngle - FLAP_APEX_IMPINGE_MARGIN, this.faceInteriorAngles[2]);
      const outerPt1 = hingedPlotByProjectionDistance(
        this.faceBoundaryPoints[1], this.faceBoundaryPoints[0], flapApexAngle, -this.ascendantEdgeTabDepth,
      );
      const outerPt2 = hingedPlotByProjectionDistance(
        this.faceBoundaryPoints[0], this.faceBoundaryPoints[1], -FLAP_BASE_ANGLE, this.ascendantEdgeTabDepth,
      );

      return roundedEdgePath(
        [this.faceBoundaryPoints[0], outerPt1, outerPt2, this.faceBoundaryPoints[1]],
        self.ascendantEdgeTabsSpec.flapRoundingDistanceRatio,
      );
    },
    get nonTabbedAscendantScores() {
      // inter-face scoring
      return this.faceTabFenceposts.slice(1, -1).reduce((path, endPt) => {
        const pathData = strokeDashPath(this.faceBoundaryPoints[0], endPt, self.interFaceScoreDashSpec);
        return path.concatPath(pathData);
      }, (new PathData()));
    },

    get ascendantEdgeTabs() {
      const ascendantTabs = ascendantEdgeConnectionTabs(
        this.faceBoundaryPoints[1], this.faceBoundaryPoints[0],
        self.ascendantEdgeTabsSpec, self.interFaceScoreDashSpec, this.tabIntervalRatios, this.tabGapIntervalRatios,
      );
      const rotationMatrix = `rotate(${radToDeg(-self.pyramid.geometry.faceCount * this.faceInteriorAngles[2])})`;
      ascendantTabs.male.cut.transform(rotationMatrix);
      ascendantTabs.male.score.transform(rotationMatrix);
      return ascendantTabs;
    },

    get makePaths() {
      const {
        pyramid: {
          geometry: { faceCount },
        },
        baseScoreDashSpec,
        baseEdgeTabsSpec,
      } = self;
      const {
        faceInteriorAngles, ascendantEdgeTabDepth, faceTabFenceposts,
      } = this;
      const cut = new PathData();
      const score = new PathData();
      score.concatPath(this.nonTabbedAscendantScores);
      cut.concatPath(this.femaleAscendantFlap);

      // base edge tabs
      faceTabFenceposts.slice(0, -1).forEach((edgePt1, index) => {
        const edgePt2 = faceTabFenceposts[index + 1];
        const baseEdgeTab = baseEdgeConnectionTab(
          edgePt1, edgePt2, ascendantEdgeTabDepth, baseEdgeTabsSpec, baseScoreDashSpec,
        );
        cut.concatPath(baseEdgeTab.cut);
        score.concatPath(baseEdgeTab.score);
      });

      // male tabs
      cut.concatPath(this.ascendantEdgeTabs.male.cut);
      score.concatPath(this.ascendantEdgeTabs.male.score);

      // female inner
      cut.concatPath(this.ascendantEdgeTabs.female.cut);
      score.concatPath(this.ascendantEdgeTabs.female.score);

      if (this.texturePathD) {
        const insetDecorationPath = (new PathData(this.texturePathD))
          .transform(`${
            this.borderInsetFaceHoleTransformMatrix.toString()} ${
            this.pathScaleMatrix.toString()}`);
        range(faceCount).forEach((index) => {
          const isOdd = !!(index % 2);
          const xScale = isOdd ? -1 : 1;
          const asymetryNudge = isOdd ? faceInteriorAngles[2] - 2 * ((Math.PI / 2) - faceInteriorAngles[0]) : 0;
          const rotationRad = -1 * xScale * index * faceInteriorAngles[2] + asymetryNudge;
          const tiledDecorationPath = (new PathData()).concatPath(insetDecorationPath)
            .transform(`scale(${xScale}, 1) rotate(${radToDeg(rotationRad)})`);
          cut.concatPath(tiledDecorationPath);
        });
      }
      return { cut, score };
    },
    // get borderInsetFaceHoleTransform() {
    //   return `translate(${self.insetPolygon.vertices[0].x}, ${self.insetPolygon.vertices[0].y}) scale(${
    //     (self.insetPolygon.box.width) / self.borderPolygon.box.width
    //   })`;

    get borderInsetFaceHoleTransformMatrix(): DOMMatrixReadOnly {
      const scale = 1 / this.borderToInsetRatio;
      const insetPolygonPoints = offsetPolygonPoints(this.faceBoundaryPoints, -this.ascendantEdgeTabDepth);
      const { x: inX, y: inY } = insetPolygonPoints[0];
      return (new DOMMatrixReadOnly()).translate(inX, inY).scale(scale, scale);
    },

    get textureBorderWidth() {
      const { ascendantEdgeTabsSpec: { tabDepthToTraversalLength } } = self;
      return tabDepthToTraversalLength * FACE_FIRST_EDGE_NORMALIZED_SIZE * this.borderToInsetRatio;
    },

    get pathScaleMatrix(): DOMMatrixReadOnly {
      return (new DOMMatrixReadOnly()).scale(this.faceLengthAdjustRatio, this.faceLengthAdjustRatio);
    },
    get texturePathD() {
      if (!self.faceDecoration) { return null; }

      if (getType(self.faceDecoration) === TextureFaceDecorationModel) {
        const { pattern, transformMatrix } = self.faceDecoration as ITextureFaceDecorationModel;
        if (getType(pattern) === PathFaceDecorationPatternModel) {
          const { pathD, isPositive } = pattern as IPathFaceDecorationPatternModel;
          return getBoundedTexturePathD(
            closedPolygonPath(this.normalizedDecorationBoundaryPoints).getD(),
            pathD,
            transformMatrix.toString(),
            isPositive,
          );
        }
      } else if (getType(self.faceDecoration) === RawFaceDecorationModel) {
        const { dValue } = self.faceDecoration as IRawFaceDecorationModel;
        return dValue;
      }
      // invalid types caught by runtime mst type checking, for linting only
      return null;
    },
  //  =========================================================
  }))
  .actions((self) => ({
    afterCreate() {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      reaction(
        () => [self.normalizedDecorationBoundaryPoints, self.faceDecoration],
        () => {
          this.sendTextureUpdate();
        },
      );

      reaction(
        () => [self.pyramid.shapeName],
        () => {
          this.sendTextureUpdate();
        },
      );

      reaction(() => self.textureBorderWidth, () => {
        this.sendTextureBorderData();
      });
    },

    sendTextureBorderData: debounce(() => {
      globalThis.ipcRenderer.send(
        EVENTS.UPDATE_TEXTURE_EDITOR_BORDER_DATA, self.borderToInsetRatio, self.insetToBorderOffset,
      );
    }, 250),

    setPyramidShapeName(name: string) {
      self.faceDecoration = undefined;
      self.pyramid.shapeName = name;
    },

    setRawFaceDecoration(d) {
      self.faceDecoration = RawFaceDecorationModel.create({ dValue: d });
    },

    setTextureFaceDecoration(snapshot) {
      self.faceDecoration = TextureFaceDecorationModel.create(snapshot);
    },

    setUseDottedStroke(useDotted) {
      self.useDottedStroke = useDotted;
      if (useDotted) {
        self.interFaceScoreDashSpec = DashPatternModel.create(defaultStrokeDashSpec);
        self.baseScoreDashSpec = DashPatternModel.create(defaultStrokeDashSpec);
      } else {
        self.interFaceScoreDashSpec = undefined;
        self.baseScoreDashSpec = undefined;
      }
    },

    setInterFaceScoreDashSpecPattern(id) {
      self.interFaceScoreDashSpec.strokeDashPathPattern = resolveIdentifier(
        StrokeDashPathPatternModel, getParent(self), id,
      );
    },

    setBaseScoreDashSpecPattern(id) {
      self.baseScoreDashSpec.strokeDashPathPattern = resolveIdentifier(
        StrokeDashPathPatternModel, getParent(self), id,
      );
    },

    sendTextureUpdate() {
      // @ts-ignore
      globalThis.ipcRenderer.send(EVENTS.UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION,
        self.normalizedDecorationBoundaryPoints,
        self.pyramid.shapeName,
        self.faceDecoration);
    },
  }));

export interface IPyramidNetModel extends Instance<typeof PyramidNetModel> {}

export const defaultModelData:SnapshotIn<typeof PyramidNetModel> = {
  // @ts-ignore
  pyramid: { shapeName: 'small-triambic-icosahedron' },
  ascendantEdgeTabsSpec: {
    flapRoundingDistanceRatio: 1,
    holeFlapTaperAngle: 0.3141592653589793,
    holeReachToTabDepth: 0.1,
    holeWidthRatio: 0.4,
    midpointDepthToTabDepth: 0.5,
    tabDepthToTraversalLength: 0.04810606060599847,
    tabStartGapToTabDepth: 1,
    tabEdgeEndpointsIndentation: 1,
    tabControlPointsProtrusion: 0.6,
    tabControlPointsAngle: 0.5,
    tabsCount: 3,
  },
  baseEdgeTabsSpec: {
    finDepthToTabDepth: 1.1,
    finOffsetRatio: 0.75,
    holeBreadthToHalfWidth: 0.25,
    holeDepthToTabDepth: 0.5,
    holeTaper: 0.6981317007977318,
    tabDepthToAscendantTabDepth: 1.5,
    scoreTabMidline: false,
    roundingDistanceRatio: 0.1,
  },
  // @ts-ignore
  useDottedStroke: false,
  shapeHeightInCm: 20,
};
