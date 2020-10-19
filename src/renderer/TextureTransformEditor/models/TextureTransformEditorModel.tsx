import { inRange } from 'lodash';
import { Instance, types } from 'mobx-state-tree';

import { PointTuple } from '../../common/util/geom';
import { BoundaryModel } from './BoundaryModel';
import { TextureModel } from './TextureModel';
import { DimensionsModel } from './DimensionsModel';
import { EVENTS } from '../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import {
  addTuple,
  calculateTransformOriginChangeOffset,
  matrixTupleTransformPoint,
  negateMap,
} from '../../common/util/2d-transform';

const getCoverScale = (bounds, image) => {
  const widthScale = bounds.width / image.width;
  const heightScale = bounds.height / image.height;
  const widthIsClamp = widthScale >= heightScale;
  return {
    widthIsClamp,
    scale: widthIsClamp ? widthScale : heightScale,
  };
};
const getFitScale = (bounds, image) => {
  if (!bounds || !image) {
    return null;
  }
  const widthIsClamp = (bounds.width / bounds.height) <= (image.width / image.height);
  return {
    widthIsClamp,
    scale: widthIsClamp ? bounds.width / image.width : bounds.height / image.height,
  };
};
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
      if (!self.texture) {
        return;
      }
      globalThis.ipcRenderer.send(EVENTS.UPDATE_DIELINE_VIEWER, self.texture);
    },
  }));

export interface ITextureTransformEditorModel extends Instance<typeof TextureTransformEditorModel> {
}
