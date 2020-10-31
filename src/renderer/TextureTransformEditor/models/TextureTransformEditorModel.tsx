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
  .model('TextureTransformEditor', {
    shapeName: types.maybe(types.string),
    decorationBoundary: types.maybe(BoundaryModel),
    texture: types.maybe(TextureModel),
    // since both controls and matrix function require degrees, use degrees as unit instead of radians
    placementAreaDimensions: types.maybe(DimensionsModel),
    viewScale: types.maybe(types.number),
  })
  .volatile(() => ({
    borderToInsetRatio: null,
    insetToBorderOffset: null,
    viewScaleDiff: 1,
    autoRotatePreview: true,
    showNodes: false,
    nodeScaleMux: 1,
    selectedTextureNodeIndex: null,
    MIN_VIEW_SCALE: 0.3,
    MAX_VIEW_SCALE: 3,
  }))
  .views((self) => ({
    get imageCoverScale() {
      if (!self.decorationBoundary || !self.texture) {
        return undefined;
      }
      return getCoverScale(self.decorationBoundary.viewBoxAttrs, self.texture.dimensions);
    },
    get faceFittingScale() {
      if (!self.placementAreaDimensions || !self.decorationBoundary) {
        return undefined;
      }
      return getFitScale(self.placementAreaDimensions, self.decorationBoundary.viewBoxAttrs);
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
    get selectedTextureNode() {
      return (self.selectedTextureNodeIndex !== null && self.texture)
        && self.texture.destinationPoints[self.selectedTextureNodeIndex];
    },
    get faceBoundary() {
      if (!self.decorationBoundary || !self.borderToInsetRatio) { return undefined; }
      const vertices = self.decorationBoundary.vertices
        .map(([x, y]) => [
          (x * self.borderToInsetRatio) + self.insetToBorderOffset[0],
          (y * self.borderToInsetRatio) + self.insetToBorderOffset[1]]);
      return BoundaryModel.create({ vertices });
    },
  })).actions((self) => ({
    afterCreate() {
      globalThis.ipcRenderer.on(EVENTS.UPDATE_TEXTURE_EDITOR_BORDER_DATA,
        (e, borderToInsetRatio, insetToBorderOffset) => {
          this.setFaceBorderData(borderToInsetRatio, insetToBorderOffset);
        });
    },

    setFaceBorderData(borderToInsetRatio, insetToBorderOffset) {
      self.borderToInsetRatio = borderToInsetRatio;
      self.insetToBorderOffset = insetToBorderOffset;
    },

    setPlacementAreaDimensions(placementAreaDimensions) {
      self.placementAreaDimensions = placementAreaDimensions;
    },
    setViewScaleDiff(mux) {
      if (inRange(mux * self.viewScale, self.MIN_VIEW_SCALE, self.MAX_VIEW_SCALE)) {
        self.viewScaleDiff = mux;
      }
    },
    setSelectedTextureNodeIndex(index) {
      self.selectedTextureNodeIndex = index;
    },
    setShowNodes(showNodes) {
      self.showNodes = showNodes;
      if (!self.showNodes) { self.selectedTextureNodeIndex = undefined; }
    },
    setNodeScaleMux(mux) {
      self.nodeScaleMux = mux;
    },
    setAutoRotatePreview(shouldRotate) {
      self.autoRotatePreview = shouldRotate;
    },
    reconcileViewScaleDiff() {
      self.viewScale = self.viewScaleDragged;
      self.viewScaleDiff = 1;
    },
    fitTextureToFace() {
      const { viewBoxAttrs } = self.decorationBoundary;
      const { dimensions: textureDimensions } = self.texture;
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const { height, width, xmin } = viewBoxAttrs;
      const { scale, widthIsClamp } = self.imageCoverScale;
      self.texture.translate = widthIsClamp
        ? [xmin, (height - (textureDimensions.height * scale)) / 2]
        : [xmin + (width - (textureDimensions.width * scale)) / 2, 0];
      self.texture.scale = self.imageCoverScale.scale;
    },
    setTextureInstance(pathD, sourceFileName) {
      self.showNodes = false;
      self.selectedTextureNodeIndex = null;
      self.texture = TextureModel.create({
        pathD, sourceFileName, scale: 1, rotate: 0, translate: [0, 0], transformOrigin: [0, 0], isPositive: true,
      });
    },
    setTexturePath(pathD, sourceFileName, recenterPath = false) {
      this.setTextureInstance(pathD, sourceFileName);
      if (recenterPath) {
        this.fitTextureToFace();
        this.repositionOriginOverCorner(0);
      }
    },
    async setTextureFromFile(url) {
      const d = await globalThis.ipcRenderer
        .invoke(EVENTS.GET_SVG_STRING_BY_PATH, url)
        .then((svgString) => extractCutHolesFromSvgString(svgString));
      const fileNameWithExtension = await globalThis.ipcRenderer.invoke(EVENTS.GET_PATH_BASENAME, url);
      // TODO: error handling
      // @ts-ignore
      // file dialog filters only svg files thus slice is safe to trim extension
      this.setTexturePath(d, fileNameWithExtension.slice(0, -4), true);
    },
    // TODO: add limits for view scale and
    // these seem like the domain of the texture model but setters for
    // textureScaleDiff (and more to follow) need boundary
    textureEditorUpdateHandler(decorationBoundaryVertices, shapeName, faceDecoration) {
      self.shapeName = shapeName;
      // @ts-ignore
      self.decorationBoundary = BoundaryModel.create({ vertices: decorationBoundaryVertices });

      if (faceDecoration) {
        self.texture = TextureModel.create(faceDecoration);
      } else {
        self.texture = undefined;
      }
      self.viewScale = 0.8;
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
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const originAbsolute = matrixTupleTransformPoint(
        self.texture.transformMatrixDragged, self.texture.transformOrigin,
      );
      const delta = addTuple(originAbsolute.map(negateMap), self.decorationBoundary.vertices[vertexIndex]);
      self.texture.translate = addTuple(delta, self.texture.translate);
    },
    repositionSelectedNodeOverCorner(vertexIndex) {
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const svgTextureNode = matrixTupleTransformPoint(
        self.texture.transformMatrixDragged, self.selectedTextureNode,
      );
      const diff = addTuple(svgTextureNode, self.decorationBoundary.vertices[vertexIndex].map(negateMap));
      self.texture.translate = addTuple(diff.map(negateMap), self.texture.translate);
    },
    repositionOriginOverCorner(vertexIndex) {
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const relVertex = matrixTupleTransformPoint(
        self.texture.transformMatrix.inverse(), self.decorationBoundary.vertices[vertexIndex],
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
