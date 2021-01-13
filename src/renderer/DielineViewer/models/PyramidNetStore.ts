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
  CM_TO_PIXELS_RATIO,
  getTextureTransformMatrix,
  offsetPolygonPoints,
  polygonPointsGivenAnglesAndSides,
  RawPoint,
  scalePoint,
  triangleAnglesGivenSides,
} from '../../common/util/geom';
import { EVENTS } from '../../../main/ipc';
import { closedPolygonPath } from '../util/shapes/generic';
import { AscendantEdgeTabsModel } from '../util/shapes/ascendantEdgeConnectionTabs';
import { BaseEdgeTabsModel } from '../util/shapes/baseEdgeConnectionTab';
import { DashPatternModel } from '../util/shapes/strokeDashPath';
import { boundingViewBoxAttrs } from '../../../common/util/svg';
import { StrokeDashPathPatternModel } from '../data/dash-patterns';
import { DimensionsModel } from '../../TextureTransformEditor/models/DimensionsModel';
import { getBoundedTexturePathD } from '../../common/util/path-boolean';

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
    tabRoundingDistanceRatio: 0.75,
    tabStartGapToTabDepth: 1,
    tabWideningAngle: 0.19634954084936207,
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
    bendGuideValley: {
      depthRatio: 0.5,
      theta: Math.PI / 4,
    },
  },
  // @ts-ignore
  useDottedStroke: false,
  shapeHeightInCm: 20,
};
