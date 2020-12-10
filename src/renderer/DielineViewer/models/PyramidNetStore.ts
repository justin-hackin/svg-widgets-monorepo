/* eslint-disable no-param-reassign */
import { reaction } from 'mobx';
import {
  Instance, types, resolveIdentifier, getParent, getType,
} from 'mobx-state-tree';
import {
  chunk, debounce, flatten, range,
} from 'lodash';

import { polyhedra } from '../data/polyhedra';
import {
  CM_TO_PIXELS_RATIO, getTextureTransformMatrix, offsetPolygonPoints,
  polygonPointsGivenAnglesAndSides, RawPoint, scalePoint,
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

export const FaceDecorationModel = types.model({
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

export interface IFaceDecorationModel extends Instance<typeof FaceDecorationModel> {}

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
  activeCutHolePatternD: types.maybe(types.string),
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
  //  =========================================================
  }))
  .actions((self) => ({
    afterCreate() {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      reaction(
        () => [self.normalizedDecorationBoundaryPoints, self.pyramid, self.faceDecoration],
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
      self.pyramid.shapeName = name;
      this.setFaceDecoration(undefined);
      this.setActiveCutHolePatternD(undefined);
    },

    setActiveCutHolePatternD(d) {
      self.activeCutHolePatternD = d;
    },

    // eslint-disable-next-line func-names
    async setFaceDecoration(faceDecoration) {
      if (faceDecoration) {
        self.faceDecoration = FaceDecorationModel.create(faceDecoration);
        const { pattern, transformMatrix } = self.faceDecoration as IFaceDecorationModel;
        if (getType(pattern) === PathFaceDecorationPatternModel) {
          const { pathD, isPositive } = pattern as IPathFaceDecorationPatternModel;
          // @ts-ignore
          const croppedD = await globalThis.ipcRenderer.invoke(
            // boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive
            EVENTS.INTERSECT_SVG,
            closedPolygonPath(self.normalizedDecorationBoundaryPoints).getD(),
            pathD,
            transformMatrix.toString(),
            isPositive,
          );
          this.setActiveCutHolePatternD(croppedD);
        } else {
          this.setActiveCutHolePatternD(undefined);
        }
        return;
      }
      self.faceDecoration = undefined;
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

    loadSpec(specData: IPyramidNetModel) {
      const { faceDecoration, ...rest } = specData;
      Object.assign(self, rest);
      this.setFaceDecoration(faceDecoration);
    },
  }));

export interface IPyramidNetModel extends Instance<typeof PyramidNetModel> {}
