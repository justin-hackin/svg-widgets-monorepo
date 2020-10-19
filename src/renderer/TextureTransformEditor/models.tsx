/* eslint-disable no-param-reassign */
import { createContext, useContext } from 'react';
import { types, Instance } from 'mobx-state-tree';
import makeInspectable from 'mobx-devtools-mst';

// @ts-ignore
import { Polygon, point } from '@flatten-js/core';
import { svgPathBbox } from 'svg-path-bbox';
import { inRange } from 'lodash';

import { closedPolygonPath } from '../DielineViewer/util/shapes/generic';
import { EVENTS } from '../../main/ipc';
import { extractCutHolesFromSvgString } from '../DielineViewer/util/svg';
import { PointTuple } from '../common/util/geom';
import {
  addTuple,
  calculateTransformOriginChangeOffset,
  getTextureTransformMatrix,
  matrixTupleTransformPoint,
  negateMap,
} from '../common/util/2d-transform';
import { FaceDecorationModel } from '../DielineViewer/data/PyramidNetStore';

interface DimensionsObject {
  width: number,
  height: number,
}

const DimensionsModel = types.model({
  width: types.number,
  height: types.number,
});
const frozenPoint = types.frozen<PointTuple>();
const negativeMod = (n, m) => ((n % m) + m) % m;
const wrapDegrees = (deg) => negativeMod(deg, 360);
const getCoverScale = (bounds: DimensionsObject, image: DimensionsObject) => {
  const widthScale = bounds.width / image.width;
  const heightScale = bounds.height / image.height;
  const widthIsClamp = widthScale >= heightScale;
  return {
    widthIsClamp,
    scale: widthIsClamp ? widthScale : heightScale,
  };
};

const getFitScale = (bounds: (DimensionsObject | undefined), image: (DimensionsObject | undefined)) => {
  if (!bounds || !image) { return null; }
  const widthIsClamp = (bounds.width / bounds.height) <= (image.width / image.height);
  return {
    widthIsClamp,
    scale: widthIsClamp ? bounds.width / image.width : bounds.height / image.height,
  };
};

const BoundaryModel = types.model({
  faceVertices: types.frozen(types.array(frozenPoint)),
}).views((self) => ({
  get viewBoxAttrs() {
    const poly = new Polygon();
    poly.addFace(self.faceVertices.map((vert) => point(...vert)));
    const {
      xmin, ymin, xmax, ymax,
    } = poly.box;
    return {
      xmin, ymin, width: xmax - xmin, height: ymax - ymin,
    };
  },
  get pathD() {
    return closedPolygonPath(self.faceVertices).getD();
  },
}));

export interface IBoundaryModel extends Instance<typeof BoundaryModel> {
}

const transformDiffDefaults = {
  translateDiff: [0, 0],
  rotateDiff: 0,
  scaleDiff: 1,
  transformOriginDiff: [0, 0],
};
export const TextureModel = FaceDecorationModel
  .volatile(() => ({ ...transformDiffDefaults }))
  .views((self) => ({
    get dimensions() {
      const [xmin, ymin, xmax, ymax] = svgPathBbox(self.pathD);
      return { width: xmax - xmin, height: ymax - ymin };
    },
    get transformOriginDragged() {
      return addTuple(self.transformOrigin, self.transformOriginDiff);
    },
    get translateDragged() {
      return addTuple(self.translate, self.translateDiff);
    },
    get rotateDragged() {
      return wrapDegrees(self.rotate + self.rotateDiff);
    },
    get scaleDragged() {
      return self.scale * self.scaleDiff;
    },
    get transformMatrixDragged() {
      return getTextureTransformMatrix(
        self.transformOrigin,
        this.scaleDragged, this.rotateDragged, this.translateDragged,
      );
    },
    get transformMatrixDraggedStr() {
      return this.transformMatrixDragged && this.transformMatrixDragged.toString();
    },
  }))
  .actions((self) => ({
    setScaleDiff(mux) {
      self.scaleDiff = mux;
    },
    reconcileScaleDiff() {
      self.scale *= self.scaleDiff;
      self.scaleDiff = 1;
    },
    setTranslateDiff(delta) {
      self.translateDiff = delta;
    },
    reconcileTranslateDiff() {
      self.translate = addTuple(self.translate, self.translateDiff);
      self.translateDiff = [0, 0];
    },
    setRotate(rotate) {
      self.rotate = rotate;
    },
    setRotateDiff(delta) {
      self.rotateDiff = delta;
    },
    reconcileRotateDiff() {
      self.rotate = wrapDegrees(self.rotate + self.rotateDiff);
      self.rotateDiff = 0;
    },
    setTransformOriginDiff(delta) {
      self.transformOriginDiff = delta;
    },
    reconcileTransformOriginDiff() {
      const relativeDifference = calculateTransformOriginChangeOffset(
        self.transformOrigin, self.transformOriginDragged,
        self.scaleDragged, self.rotateDragged, self.translateDragged,
      );
      self.transformOrigin = self.transformOriginDragged;
      self.translate = addTuple(self.translate, relativeDifference.map(negateMap));
      self.transformOriginDiff = [0, 0];
    },
    setIsPositive(isPositive) {
      self.isPositive = isPositive;
    },
    resetTransformDiff() {
      Object.assign(self, transformDiffDefaults);
    },
  }));

export interface ITextureModel extends Instance<typeof TextureModel> {
}

export const TextureTransformEditorModel = types
  .model({
    shapeName: types.maybe(types.string),
    boundary: types.maybe(BoundaryModel),
    texture: types.maybe(TextureModel),
    // since both controls and matrix function require degrees, use degrees as unit instead of radians
    placementAreaDimensions: types.maybe(DimensionsModel),
    viewScale: types.optional(types.number, 1),
  })
  .volatile(() => ({
    viewScaleDiff: 1,
    MIN_VIEW_SCALE: 0.3,
    MAX_VIEW_SCALE: 3,

  }))
  .views((self) => ({
    get imageCoverScale() {
      if (!self.boundary || !self.texture) {
        return undefined;
      }
      return getCoverScale(self.boundary.viewBoxAttrs, self.texture.dimensions);
    },
    get faceFittingScale() {
      if (!self.placementAreaDimensions || !self.boundary) {
        return undefined;
      }
      return getFitScale(self.placementAreaDimensions, self.boundary.viewBoxAttrs);
    },
    get minImageScale() {
      return this.imageCoverScale && (0.1 * this.imageCoverScale.scale);
    },
    get maxImageScale() {
      return this.imageCoverScale && (5 * this.imageCoverScale.scale);
    },
    get viewScaleDragged() {
      return self.viewScale && (self.viewScale * self.viewScaleDiff);
    },
    get viewScaleCenterPercentStr() {
      return this.viewScaleDragged && `${((1 - this.viewScaleDragged) * 100) / 2}%`;
    },
    get viewScalePercentStr() {
      return this.viewScaleDragged && `${this.viewScaleDragged * 100}%`;
    },
  })).actions((self) => ({
    setPlacementAreaDimensions(placementAreaDimensions) {
      self.placementAreaDimensions = placementAreaDimensions;
    },
    setViewScaleDiff(mux) {
      if (inRange(mux * self.viewScale, self.MIN_VIEW_SCALE, self.MAX_VIEW_SCALE)) {
        self.viewScaleDiff = mux;
      }
    },
    reconcileViewScaleDiff() {
      self.viewScale = self.viewScaleDragged;
      self.viewScaleDiff = 1;
    },
    fitTextureToFace() {
      const { viewBoxAttrs } = self.boundary;
      const { dimensions: textureDimensions } = self.texture;
      if (!self.texture || !self.boundary) {
        return;
      }
      const { height, width, xmin } = viewBoxAttrs;
      const { scale, widthIsClamp } = self.imageCoverScale;
      self.texture.translate = widthIsClamp
        ? [xmin, (height - (textureDimensions.height * scale)) / 2]
        : [xmin + (width - (textureDimensions.width * scale)) / 2, 0];
      self.texture.scale = self.imageCoverScale.scale;
    },
    setTextureInstance(pathD) {
      self.texture = TextureModel.create({
        pathD, scale: 1, rotate: 0, translate: [0, 0], transformOrigin: [0, 0], isPositive: false,
      });
    },
    setTexturePath(pathD, recenterPath = false) {
      this.setTextureInstance(pathD);
      if (recenterPath) {
        this.fitTextureToFace();
      }
    },
    async setTextureFromFile(url) {
      const d = await globalThis.ipcRenderer
        .invoke(EVENTS.GET_SVG_STRING_BY_PATH, url)
        .then((svgString) => extractCutHolesFromSvgString(svgString));
      // TODO: error handling
      // @ts-ignore
      this.setTexturePath(d, true);
    },
    // TODO: add limits for view scale and
    // these seem like the domain of the texture model but setters for
    // textureScaleDiff (and more to follow) need boundary
    textureEditorUpdateHandler(e, faceVertices, shapeName, faceDecoration) {
      self.shapeName = shapeName;
      // @ts-ignore
      self.boundary = BoundaryModel.create({ faceVertices });

      if (faceDecoration) {
        self.texture = TextureModel.create(faceDecoration);
      } else {
        self.viewScale = 1;
        self.texture = undefined;
      }
    },
    absoluteMovementToSvg(absCoords) {
      return absCoords.map((coord) => coord / (self.viewScaleDragged * self.faceFittingScale.scale));
    },
    translateAbsoluteCoordsToRelative(absCoords: PointTuple) {
      return matrixTupleTransformPoint(
        ((new DOMMatrixReadOnly())
          .scale(self.texture.scaleDragged, self.texture.scaleDragged)
          .rotate(self.texture.rotateDragged)
          .inverse()),
        this.absoluteMovementToSvg(absCoords),
      );
    },
    repositionTextureWithOriginOverCorner(vertexIndex) {
      if (!self.texture || !self.boundary) {
        return;
      }
      const originAbsolute = matrixTupleTransformPoint(
        self.texture.transformMatrixDragged, self.texture.transformOrigin,
      );
      const delta = addTuple(originAbsolute, self.boundary.faceVertices[vertexIndex].map(negateMap)).map(negateMap);
      self.texture.translate = addTuple(delta, self.texture.translate);
    },
    repositionOriginOverCorner(vertexIndex) {
      if (!self.texture || !self.boundary) {
        return;
      }
      const relVertex = matrixTupleTransformPoint(
        self.texture.transformMatrix.inverse(), self.boundary.faceVertices[vertexIndex],
      );
      const delta = addTuple(relVertex.map(negateMap), self.texture.transformOrigin).map(negateMap);
      const newTransformOrigin = addTuple(delta, self.texture.transformOrigin);
      self.texture.translate = addTuple(
        self.texture.translate,
        calculateTransformOriginChangeOffset(self.texture.transformOrigin, newTransformOrigin,
          self.texture.scale, self.texture.rotate, self.texture.translate).map(negateMap),
      );
      self.texture.transformOrigin = newTransformOrigin;
    },
    sendTexture() {
      if (!self.texture) { return; }
      globalThis.ipcRenderer.send(EVENTS.UPDATE_DIELINE_VIEWER, self.texture);
    },
  }));

export interface ITextureTransformEditorModel extends Instance<typeof TextureTransformEditorModel> {}

export const textureTransformEditorStore = makeInspectable(TextureTransformEditorModel.create());
// @ts-ignore
window.editorStore = textureTransformEditorStore;
const TextureTransformEditorStoreContext = createContext<ITextureTransformEditorModel>(
  textureTransformEditorStore,
);

export const { Provider } = TextureTransformEditorStoreContext;

export function useMst() {
  const store = useContext(TextureTransformEditorStoreContext);
  return store;
}
