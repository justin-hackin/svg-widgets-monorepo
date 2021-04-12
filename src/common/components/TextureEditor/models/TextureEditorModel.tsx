import { inRange } from 'lodash';
import {
  getParentOfType, getSnapshot, Instance, tryResolve, types,
} from 'mobx-state-tree';

import { BoundaryModel } from './BoundaryModel';
import { TextureModel } from './TextureModel';
import { ModifierTrackingModel } from './ModifierTrackingModel';
import {
  calculateTransformOriginChangeOffset,
  getOriginPoint,
  scalePoint,
  sumPoints,
  transformPoint,
} from '../../../util/geom';
import { IImageFaceDecorationPatternModel } from '../../../models/ImageFaceDecorationPatternModel';
import { ShapePreviewModel } from './ShapePreviewModel';
import { PyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { UndoManagerWithGroupState } from '../../UndoManagerWithGroupState';
import { extractCutHolesFromSvgString } from '../../../util/svg';
import { EVENTS } from '../../../constants';
import { ANALYTICS_BUFFERED_EVENTS } from '../../../util/analytics';

// TODO: put in preferences
const DEFAULT_IS_POSITIVE = true;
const DEFAULT_VIEW_SCALE = 0.8;

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

const specFileExtension = 'pnst';
const specFileExtensionName = 'Texture for Pyramid Net Spec';

export const TextureEditorModel = types
  .model('Texture Editor', {
    texture: types.maybe(TextureModel),
    // since both controls and matrix function require degrees, use degrees as unit instead of radians
    viewScale: types.optional(types.number, DEFAULT_VIEW_SCALE),
    shapePreview: types.optional(ShapePreviewModel, {}),
  })
  .volatile((self) => ({
    modifierTracking: ModifierTrackingModel.create({}),
    history: UndoManagerWithGroupState.create({}, { targetStore: self }),
    shapePreviewIsFullScreen: false,
    placementAreaDimensions: null,
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
    disposers: [],
  }))
  .views((self) => ({
    get parentPyramidNetPluginModel() {
      return getParentOfType(self, PyramidNetPluginModel);
    },
    get shapeName() {
      return this.parentPyramidNetPluginModel.pyramidNetSpec.pyramid.shapeName;
    },

    get decorationBoundary() {
      return BoundaryModel.create({
        vertices:
        this.parentPyramidNetPluginModel.pyramidNetSpec.normalizedDecorationBoundaryPoints,
      });
    },

    get imageCoverScale() {
      if (!this.decorationBoundary || !self.texture) {
        return undefined;
      }
      return getCoverScale(this.decorationBoundary.viewBoxAttrs, self.texture.dimensions);
    },
    get faceFittingScale() {
      if (!self.placementAreaDimensions || !this.decorationBoundary) {
        return undefined;
      }
      return getFitScale(self.placementAreaDimensions, this.decorationBoundary.viewBoxAttrs);
    },
    get shapePreviewDimensions() {
      if (!self.placementAreaDimensions) { return null; }
      return self.shapePreviewIsFullScreen
        ? { width: window.innerWidth, height: window.innerHeight }
        : self.placementAreaDimensions;
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
      if (!this.decorationBoundary || !self.borderToInsetRatio) { return undefined; }
      // TODO: no more dirty type checking
      const textureIsBordered = self.texture
        ? (self.texture.pattern as IImageFaceDecorationPatternModel).isBordered : null;
      if (textureIsBordered === false) {
        return this.decorationBoundary;
      }
      const vertices = this.decorationBoundary.vertices
        .map((pt) => sumPoints(scalePoint(pt, self.borderToInsetRatio), self.insetToBorderOffset));
      return BoundaryModel.create({ vertices });
    },
    get borderToInsetRatio() {
      return this.parentPyramidNetPluginModel.pyramidNetSpec.borderToInsetRatio;
    },
    get insetToBorderOffset() {
      return this.parentPyramidNetPluginModel.pyramidNetSpec.insetToBorderOffset;
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
    resetNodesEditor() {
      self.showNodes = false;
      self.selectedTextureNodeIndex = null;
    },
    clearTexture() {
      self.texture = undefined;
    },
    setTextureFromPattern(patternSnapshot) {
      this.resetNodesEditor();

      self.texture = TextureModel.create({
        pattern: patternSnapshot,
        scale: 1,
        rotate: 0,
        translate: getOriginPoint(),
        transformOrigin: getOriginPoint(),
      });
      this.fitTextureToFace();
      this.repositionOriginOverCorner(0);
    },

    setTexture(snapshot) {
      self.texture = snapshot;
    },

    setTexturePath(pathD, sourceFileName) {
      this.setTextureFromPattern({
        pathD, sourceFileName, isPositive: DEFAULT_IS_POSITIVE,
      });
    },
    setTextureImage(imageData, dimensions, sourceFileName) {
      this.setTextureFromPattern({
        imageData, dimensions, sourceFileName,
      });
    },

    setShapePreviewIsFullScreen(isFullScreen) {
      self.shapePreviewIsFullScreen = isFullScreen;
    },

    // TODO: duplicated in PyramidNetMakerStore, consider a common model prototype across BrowserWindows
    getFileBasename() {
      return `${self.shapeName || 'shape'}__${tryResolve(self, '/texture/pattern/sourceFileName') || 'undecorated'}`;
    },

    // TODO: add limits for view scale and
    // these seem like the domain of the texture model but setters for
    // textureScaleDiff (and more to follow) need boundary
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

    sendTextureToDielineEditor() {
      if (!self.texture) { return; }
      self.parentPyramidNetPluginModel.pyramidNetSpec.setTextureFaceDecoration(getSnapshot(self.texture));
    },
    saveTextureArrangement() {
      if (!self.texture) { return; }
      const fileData = {
        shapeName: self.shapeName,
        textureSnapshot: getSnapshot(self.texture),
      };
      globalThis.ipcRenderer.invoke(EVENTS.DIALOG_SAVE_JSON, fileData, {
        message: 'Save texture arrangement',
        defaultPath: `${self.shapeName}__${self.texture.pattern.sourceFileName}.${specFileExtension}`,
      }, specFileExtension, specFileExtensionName);
    },
    setTextureFromSnapshot(textureSnapshot) {
      self.texture = TextureModel.create(textureSnapshot);
    },
    // TODO: ts type the patternInfo
    assignTextureFromPatternInfo(patternInfo) {
      if (patternInfo) {
        if (patternInfo.isPath) {
          const { svgString, sourceFileName } = patternInfo;
          const pathD = extractCutHolesFromSvgString(svgString);
          this.setTexturePath(pathD, sourceFileName);
        } else {
          const { imageData, dimensions, sourceFileName } = patternInfo.pattern;
          this.setTextureImage(imageData, dimensions, sourceFileName);
        }
      }
    },
    async openTextureArrangement() {
      const res = await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_OPEN_JSON, {
        message: 'Import texture arrangement',
      }, specFileExtension, specFileExtensionName);
      // TODO: snackbar error alerts
      if (!res) { return; }

      // @ts-ignore
      const { fileData: { shapeName, textureSnapshot } } = res;
      if (!textureSnapshot) {
        return;
      }
      if (shapeName !== self.shapeName) {
        self.parentPyramidNetPluginModel.pyramidNetSpec.setPyramidShapeName(shapeName);
      }
      this.setTextureFromSnapshot(textureSnapshot);
    },
  }))
  .actions(() => {
    // ======== ANALYTICS TRACkING ========
    if (process.env.BUILD_ENV !== 'web' || process.env.NODE_ENV === 'development') {
      // reduces the number of env checks in call sites while preserving type safety
      return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        incrementTransformsBuffer(type: ANALYTICS_BUFFERED_EVENTS) {},
      };
    }

    const numTransformsByType = Object.keys(ANALYTICS_BUFFERED_EVENTS)
      .reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {});

    let sendAnaylticsBuffersInterval;
    const sendAnalytics = () => {
      Object.keys(numTransformsByType).forEach((type) => {
        if (numTransformsByType[type]) {
          // TODO: why doesn't typescript respect globals
          // @ts-ignore
          dataLayer.push({ [type]: numTransformsByType[type] });
          numTransformsByType[type] = 0;
        }
      });
    };
    return {
      afterCreate() {
        sendAnaylticsBuffersInterval = setInterval(sendAnalytics, 60000);
      },
      beforeDestroy() {
        sendAnalytics();
        clearInterval(sendAnaylticsBuffersInterval);
      },
      incrementTransformsBuffer(type: ANALYTICS_BUFFERED_EVENTS) {
        numTransformsByType[type] += 1;
      },
    };
  });

export interface ITextureEditorModel extends Instance<typeof TextureEditorModel> {}
