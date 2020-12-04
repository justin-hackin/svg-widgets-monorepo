import { inRange } from 'lodash';
import { Instance, resolvePath, types } from 'mobx-state-tree';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import { UndoManager } from 'mst-middlewares';
import { BoundaryModel } from './BoundaryModel';
// eslint-disable-next-line import/no-cycle
import { TextureModel } from './TextureModel';

import { DimensionsModel } from './DimensionsModel';
import { EVENTS } from '../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { ModifierTrackingModel } from './ModifierTrackingModel';
import {
  calculateTransformOriginChangeOffset, getOriginPoint, scalePoint, sumPoints, transformPoint,
} from '../../common/util/geom';

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
    history: types.optional(UndoManager, {}),
    modifierTracking: types.optional(ModifierTrackingModel, {}),
  })
  .volatile(() => ({
    shapeObject: null,
    gltfExporter: new GLTFExporter(),
    // amount of scaling required to make the decoration area match the size of the face boundary
    borderToInsetRatio: null,
    // translation required to bring the decoration area first corner to the face boundary first corner
    insetToBorderOffset: null,
    viewScaleDiff: 1,
    autoRotatePreview: false,
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
        .map((pt) => sumPoints(scalePoint(pt, self.borderToInsetRatio), self.insetToBorderOffset));
      return BoundaryModel.create({ vertices });
    },
  })).actions((self) => ({
    setFaceBorderData(borderToInsetRatio, insetToBorderOffset) {
      self.borderToInsetRatio = borderToInsetRatio;
      self.insetToBorderOffset = insetToBorderOffset;
    },

    setPlacementAreaDimensions(placementAreaDimensions) {
      self.history.withoutUndo(() => {
        self.placementAreaDimensions = placementAreaDimensions;
      });
    },
    setViewScaleDiff(mux) {
      if (inRange(mux * self.viewScale, self.MIN_VIEW_SCALE, self.MAX_VIEW_SCALE)) {
        self.history.withoutUndo(() => { self.viewScaleDiff = mux; });
      }
    },
    reconcileViewScaleDiff() {
      self.viewScale = self.viewScaleDragged;
      self.viewScaleDiff = 1;
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
    fitTextureToFace() {
      const { viewBoxAttrs } = self.decorationBoundary;
      const { dimensions: textureDimensions } = self.texture;
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const { height, width, xmin } = viewBoxAttrs;
      const { scale, widthIsClamp } = self.imageCoverScale;
      self.texture.translate = widthIsClamp
        ? { x: xmin, y: (height - (textureDimensions.height * scale)) / 2 }
        : { x: xmin + (width - (textureDimensions.width * scale)) / 2, y: 0 };
      self.texture.scale = self.imageCoverScale.scale;
    },
    setTextureInstance(pathD, sourceFileName) {
      self.showNodes = false;
      self.selectedTextureNodeIndex = null;
      self.texture = TextureModel.create({
        pathD,
        sourceFileName,
        scale: 1,
        rotate: 0,
        translate: getOriginPoint(),
        transformOrigin: getOriginPoint(),
        isPositive: true,
      });
    },
    setTexturePath(pathD, sourceFileName, recenterPath = false) {
      this.setTextureInstance(pathD, sourceFileName);
      if (recenterPath) {
        this.fitTextureToFace();
        this.repositionOriginOverCorner(0);
      }
    },
    setShapeObject(shape) {
      self.shapeObject = shape;
    },
    // TODO: duplicated in PyramidNetMakerStore, consider a common model prototype across BrowserWindows
    getFileBasename() {
      return `${self.shapeName || 'shape'}__${resolvePath(self, '/texture/sourceFileName') || 'undecorated'}`;
    },
    async downloadShapeGLTF() {
      return self.gltfExporter
        .parse(self.shapeObject, (shapeGLTF) => {
          globalThis.ipcRenderer.invoke(EVENTS.SAVE_GLTF, shapeGLTF, {
            message: 'Save shape preview',
            defaultPath: `${this.getFileBasename()}.gltf`,
          });
        }, {});
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
      // eslint-disable-next-line no-shadow
      const thisAction = () => {
        self.shapeName = shapeName;
        // @ts-ignore
        self.decorationBoundary = BoundaryModel.create({ vertices: decorationBoundaryVertices });

        if (faceDecoration) {
          self.texture = TextureModel.create(faceDecoration);
        } else {
          self.texture = undefined;
        }
        self.viewScale = 0.8;
      };

      // if decoration boundary is currently set
      // ensure undo history starts after first setting of boundary and texture
      if (!self.decorationBoundary) {
        self.history.withoutUndo(thisAction);
      } else {
        thisAction();
      }
    },
    absoluteMovementToSvg(absCoords) {
      return scalePoint(absCoords, 1 / (self.viewScaleDragged * self.faceFittingScale.scale));
    },
    translateAbsoluteCoordsToRelative(absCoords) {
      return transformPoint(
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
      const originAbsolute = transformPoint(
        self.texture.transformMatrixDragged, self.texture.transformOrigin,
      );
      self.texture.translate = sumPoints(
        self.texture.translate,
        scalePoint(originAbsolute, -1),
        self.decorationBoundary.vertices[vertexIndex],
      );
    },
    repositionSelectedNodeOverCorner(vertexIndex) {
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const svgTextureNode = transformPoint(
        self.texture.transformMatrixDragged, self.selectedTextureNode,
      );
      const diff = sumPoints(svgTextureNode, scalePoint(self.decorationBoundary.vertices[vertexIndex], -1));
      self.texture.translate = sumPoints(scalePoint(diff, -1), self.texture.translate);
    },
    repositionOriginOverCorner(vertexIndex) {
      if (!self.texture || !self.decorationBoundary) {
        return;
      }
      const relVertex = transformPoint(
        self.texture.transformMatrix.inverse(), self.decorationBoundary.vertices[vertexIndex],
      );
      const delta = scalePoint(sumPoints(scalePoint(relVertex, -1), self.texture.transformOrigin), -1);
      const newTransformOrigin = sumPoints(delta, self.texture.transformOrigin);
      self.texture.translate = sumPoints(
        self.texture.translate,
        scalePoint(calculateTransformOriginChangeOffset(self.texture.transformOrigin, newTransformOrigin,
          self.texture.scale, self.texture.rotate, self.texture.translate), -1),
      );
      self.texture.transformOrigin = newTransformOrigin;
    },

    sendTexture() {
      if (!self.texture) {
        return;
      }
      globalThis.ipcRenderer.send(EVENTS.UPDATE_DIELINE_VIEWER, self.texture);
    },
  }))
  .actions((self) => {
    const updateBorderDataHandler = (e, borderToInsetRatio, insetToBorderOffset) => {
      self.setFaceBorderData(borderToInsetRatio, insetToBorderOffset);
    };
    const shapeDecorationHandler = (_, decorationBoundaryVertices, shapeName, faceDecoration) => {
      self.textureEditorUpdateHandler(decorationBoundaryVertices, shapeName, faceDecoration);
    };

    return {
      afterCreate() {
        globalThis.ipcRenderer.on(EVENTS.UPDATE_TEXTURE_EDITOR_BORDER_DATA, updateBorderDataHandler);
        globalThis.ipcRenderer.on(EVENTS.UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION, shapeDecorationHandler);
      },
      beforeDestroy() {
        globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_TEXTURE_EDITOR_BORDER_DATA, updateBorderDataHandler);
        globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION, shapeDecorationHandler);
      },
    };
  });

export interface ITextureTransformEditorModel extends Instance<typeof TextureTransformEditorModel> {}
