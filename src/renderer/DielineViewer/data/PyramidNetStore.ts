/* eslint-disable no-param-reassign */
import { reaction } from 'mobx';
import { flow, Instance, types } from 'mobx-state-tree';

// @ts-ignore
import { Polygon } from '@flatten-js/core';
// @ts-ignore
import { offset } from '@flatten-js/polygon-offset';
// @ts-ignore
import { subtract } from '@flatten-js/boolean-op';
import {
  chunk, flatten, omit, range,
} from 'lodash';
import { polyhedra } from './polyhedra';
import {
  CM_TO_PIXELS_RATIO,
  PointLike,
  PointTuple,
  polygonPointsGivenAnglesAndSides,
  triangleAnglesGivenSides,
} from '../../common/util/geom';
import { EVENTS } from '../../../main/ipc';
import { getTextureTransformMatrix } from '../../common/util/2d-transform';
import { closedPolygonPath } from '../util/shapes/generic';
import { AscendantEdgeTabsModel } from '../util/shapes/ascendantEdgeConnectionTabs';
import { BaseEdgeTabsModel } from '../util/shapes/baseEdgeConnectionTab';
import { DashPatternModel } from '../util/shapes/strokeDashPath';

const FACE_FIRST_EDGE_NORMALIZED_SIZE = 1000;

export const FaceDecorationModel = types.model({
  pathD: types.string,
  transformOrigin: types.frozen<PointTuple>(),
  translate: types.frozen<PointTuple>(),
  rotate: types.number,
  scale: types.number,
  isPositive: types.boolean,
}).views((self) => ({
  get pathMatrix() {
    const {
      transformOrigin, rotate, scale, translate,
    } = self;
    return getTextureTransformMatrix(transformOrigin, scale, rotate, translate).toString();
  },
}));

export interface IFaceDecorationModel extends Instance<typeof FaceDecorationModel> {}

export const PyramidModel = types.model({
  shapeName: types.string,
}).views((self) => ({
  get geometry() {
    return polyhedra[self.shapeName];
  },
})).actions((self) => ({
  setShapeName(name) {
    self.shapeName = name;
  },
}));

export const PyramidNetModel = types.model({
  pyramid: PyramidModel,
  ascendantEdgeTabsSpec: types.late(() => AscendantEdgeTabsModel),
  baseEdgeTabsSpec: types.late(() => BaseEdgeTabsModel),
  shapeHeightInCm: types.number,
  faceDecoration: types.maybe(types.late(() => FaceDecorationModel)),
  baseScoreDashSpec: types.late(() => DashPatternModel),
  interFaceScoreDashSpec: types.late(() => DashPatternModel),
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

    get boundaryPoints() {
      return polygonPointsGivenAnglesAndSides(this.faceInteriorAngles, this.actualFaceEdgeLengths);
    },

    get normalizedBoundaryPoints():PointLike[] {
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

    get borderPolygon(): Polygon {
      const poly = new Polygon();
      poly.addFace(this.boundaryPoints);
      return poly;
    },

    get insetPolygon(): Polygon {
      return offset(this.borderPolygon, -this.ascendantEdgeTabDepth);
    },

    get borderOverlay(): Polygon {
      // TODO: can be converted to a path inset using @flatten-js/polygon-offset
      return subtract(this.borderPolygon, this.insetPolygon);
    },
    // get borderInsetFaceHoleTransform() {
    //   return `translate(${self.insetPolygon.vertices[0].x}, ${self.insetPolygon.vertices[0].y}) scale(${
    //     (self.insetPolygon.box.width) / self.borderPolygon.box.width
    //   })`;

    get borderInsetFaceHoleTransformMatrix(): DOMMatrixReadOnly {
      const scale = (this.insetPolygon.box.width) / this.borderPolygon.box.width;
      const { x: inX, y: inY } = this.insetPolygon.vertices[0];
      return (new DOMMatrixReadOnly()).translate(inX, inY).scale(scale, scale);
    },

    get pathScaleMatrix(): DOMMatrixReadOnly {
      return (new DOMMatrixReadOnly()).scale(this.faceLengthAdjustRatio, this.faceLengthAdjustRatio);
    },

    get asJSON(): string {
      // activeCutHolePatternD is the only property that is derived from other properties but is not computed
      // in order to avoid the use of async computed plugin
      return JSON.stringify(omit(self, ['activeCutHolePatternD']), null, 2);
    },
  //  =========================================================
  }))
  .actions((self) => ({
    afterCreate() {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      reaction(
        () => [self.normalizedBoundaryPoints, self.pyramid, self.faceDecoration],
        () => {
          this.sendTextureEditorUpdate();
        },
      );
    },

    setPyramidGeometryId(name: string) {
      self.pyramid.shapeName = name;
      this.setFaceDecoration(undefined);
    },

    setActiveCutHolePatternD(d) {
      self.activeCutHolePatternD = d;
    },

    // eslint-disable-next-line func-names
    async setFaceDecoration(faceDecoration) {
      self.faceDecoration = faceDecoration;
      if (faceDecoration) {
        const { pathD, pathMatrix, isPositive } = self.faceDecoration as IFaceDecorationModel;
        // @ts-ignore
        const croppedD = await globalThis.ipcRenderer.invoke(
          // boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive
          EVENTS.INTERSECT_SVG,
          closedPolygonPath(self.normalizedBoundaryPoints).getD(),
          pathD,
          pathMatrix,
          isPositive,
        );
        this.setActiveCutHolePatternD(croppedD);
      } else {
        this.setActiveCutHolePatternD(undefined);
      }
    },

    sendTextureEditorUpdate() {
      // @ts-ignore
      globalThis.ipcRenderer.send(EVENTS.UPDATE_TEXTURE_EDITOR,
        self.normalizedBoundaryPoints.map((pt) => ([pt.x, pt.y])),
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
