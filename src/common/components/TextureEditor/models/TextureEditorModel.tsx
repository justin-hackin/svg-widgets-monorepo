import { inRange } from 'lodash';
import fileDownload from 'js-file-download';
import {
  Model, prop, getSnapshot, model, findParent, undoMiddleware, modelAction,
} from 'mobx-keystone';
import { computed, observable, reaction } from 'mobx';
import { BoundaryModel } from './BoundaryModel';
import { TextureModel } from './TextureModel';
import { ModifierTrackingModel } from './ModifierTrackingModel';
import {
  calculateTransformOriginChangeOffset, RawPoint, scalePoint, sumPoints, transformPoint,
} from '../../../util/geom';
import { ShapePreviewModel } from './ShapePreviewModel';
import { PyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { extractCutHolesFromSvgString } from '../../../util/svg';
import {
  EVENTS,
  IS_ELECTRON_BUILD,
  IS_WEB_BUILD,
  TEXTURE_ARRANGEMENT_FILE_EXTENSION,
} from '../../../constants';
import { reportTransformsTally } from '../../../util/analytics';
import { tryResolvePath } from '../../../util/mobx-keystone';
import {
  ImageFaceDecorationPatternModel,
} from '../../../models/ImageFaceDecorationPatternModel';
import {
  PathFaceDecorationPatternModel,
} from '../../../models/PathFaceDecorationPatternModel';
import { TransformModel } from '../../../models/TransformModel';

// TODO: put in preferences
const DEFAULT_IS_POSITIVE = true;
const DEFAULT_VIEW_SCALE = 0.7;

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

const specFileExtensionName = 'Texture for Pyramid Net Spec';

@model('TextureEditorModel')
export class TextureEditorModel extends Model({
  texture: prop<TextureModel | null>(null),
  viewScale: prop<number>(DEFAULT_VIEW_SCALE),
  shapePreview: prop<ShapePreviewModel>(() => new ShapePreviewModel({})),
  modifierTracking: prop<ModifierTrackingModel>(() => new ModifierTrackingModel({})),
}) {
  @observable
  history = undoMiddleware(this);

  @observable
  shapePreviewIsFullScreen = false;

  @observable
  placementAreaDimensions = null;

  @observable
  viewScaleDiff = 1;

  @observable
  autoRotatePreview = false;

  @observable
  showNodes = false;

  @observable
  nodeScaleMux = 1;

  @observable
  selectedTextureNodeIndex = null;

  @observable
  MIN_VIEW_SCALE = 0.3;

  @observable
  MAX_VIEW_SCALE = 3;

  @observable
  decorationBoundary = undefined;

  @computed
  get parentPyramidNetPluginModel() {
    return findParent(this, (parentNode) => parentNode instanceof PyramidNetPluginModel);
  }

  @computed
  get shapeName() {
    return this.parentPyramidNetPluginModel.pyramidNetSpec.pyramid.shapeName;
  }

  @computed
  get imageCoverScale() {
    if (!this.decorationBoundary || !this.texture) {
      return undefined;
    }
    return getCoverScale(this.decorationBoundary.boundingBoxAttrs, this.texture.dimensions);
  }

  @computed
  get faceFittingScale() {
    if (!this.placementAreaDimensions || !this.decorationBoundary) {
      return undefined;
    }
    return getFitScale(this.placementAreaDimensions, this.decorationBoundary.boundingBoxAttrs);
  }

  @computed
  get shapePreviewDimensions() {
    if (!this.placementAreaDimensions) { return null; }
    return this.shapePreviewIsFullScreen
      ? { width: window.innerWidth, height: window.innerHeight }
      : this.placementAreaDimensions;
  }

  @computed
  get minImageScale() {
    return this.imageCoverScale && (0.1 * this.imageCoverScale.scale);
  }

  @computed
  get maxImageScale() {
    return this.imageCoverScale && (5 * this.imageCoverScale.scale);
  }

  @computed
  get viewScaleDragged() {
    return this.viewScale && (this.viewScale * this.viewScaleDiff);
  }

  @computed
  get viewScaleCenterPercentStr() {
    return this.viewScaleDragged && `${((1 - this.viewScaleDragged) * 100) / 2}%`;
  }

  @computed
  get viewScalePercentStr() {
    return this.viewScaleDragged && `${this.viewScaleDragged * 100}%`;
  }

  @computed
  get selectedTextureNode() {
    return (this.selectedTextureNodeIndex !== null && this.texture)
      && this.texture.destinationPoints[this.selectedTextureNodeIndex];
  }

  @computed
  get faceBoundary() {
    if (!this.decorationBoundary || !this.borderToInsetRatio) { return undefined; }
    // TODO: no more dirty type checking
    const textureIsBordered = this.texture
      ? (this.texture.pattern as ImageFaceDecorationPatternModel).isBordered : null;
    if (textureIsBordered === false) {
      return this.decorationBoundary;
    }
    const vertices = this.decorationBoundary.vertices
      .map((pt) => sumPoints(scalePoint(pt, this.borderToInsetRatio), this.insetToBorderOffset));
    return new BoundaryModel({ vertices });
  }

  @computed
  get borderToInsetRatio() {
    return this.parentPyramidNetPluginModel.pyramidNetSpec.borderToInsetRatio;
  }

  @computed
  get insetToBorderOffset() {
    return this.parentPyramidNetPluginModel.pyramidNetSpec.insetToBorderOffset;
  }

  @modelAction
  setPlacementAreaDimensions(placementAreaDimensions) {
    this.placementAreaDimensions = placementAreaDimensions;
  }

  @modelAction
  setViewScaleDiff(mux) {
    if (inRange(mux * this.viewScale, this.MIN_VIEW_SCALE, this.MAX_VIEW_SCALE)) {
      this.viewScaleDiff = mux;
    }
  }

  @modelAction
  reconcileViewScaleDiff() {
    this.viewScale = this.viewScaleDragged;
    this.viewScaleDiff = 1;
  }

  @modelAction
  setSelectedTextureNodeIndex(index) {
    this.selectedTextureNodeIndex = index;
  }

  @modelAction
  setShowNodes(showNodes) {
    this.showNodes = showNodes;
    if (!this.showNodes) { this.selectedTextureNodeIndex = undefined; }
  }

  @modelAction
  setAutoRotatePreview(shouldRotate) {
    this.autoRotatePreview = shouldRotate;
  }

  @modelAction
  fitTextureToFace() {
    const { boundingBoxAttrs } = this.decorationBoundary;
    const { dimensions: textureDimensions } = this.texture;
    if (!this.texture || !this.decorationBoundary) {
      return;
    }
    const { height, width, xmin } = boundingBoxAttrs;
    const { scale, widthIsClamp } = this.imageCoverScale;
    this.texture.transform.translate = widthIsClamp
      ? { x: xmin, y: (height - (textureDimensions.height * scale)) / 2 }
      : { x: xmin + (width - (textureDimensions.width * scale)) / 2, y: 0 };
    this.texture.transform.scale = this.imageCoverScale.scale;
  }

  @modelAction
  refitTextureToFace() {
    if (this.texture) {
      this.texture.transform = new TransformModel({});
      this.fitTextureToFace();
      this.repositionOriginOverFaceCenter();
    }
  }

  @modelAction
  resetNodesEditor() {
    this.showNodes = false;
    this.selectedTextureNodeIndex = null;
  }

  @modelAction
  clearTexture() {
    this.texture = undefined;
  }

  @modelAction
  setTextureFromPattern(pattern) {
    this.resetNodesEditor();
    this.texture = new TextureModel({ pattern });
    this.fitTextureToFace();
    this.repositionOriginOverFaceCenter();
  }

  @modelAction
  setTexture(snapshot) {
    this.texture = snapshot;
  }

  @modelAction
  setTexturePath(pathD, sourceFileName) {
    this.setTextureFromPattern(new PathFaceDecorationPatternModel({
      pathD, sourceFileName, isPositive: DEFAULT_IS_POSITIVE,
    }));
  }

  @modelAction
  setTextureImage(imageData, dimensions, sourceFileName) {
    this.setTextureFromPattern(new ImageFaceDecorationPatternModel({
      imageData, dimensions, sourceFileName,
    }));
  }

  @modelAction
  setShapePreviewIsFullScreen(isFullScreen) {
    this.shapePreviewIsFullScreen = isFullScreen;
  }

  // TODO: duplicated in PyramidNetMakerStore, consider a common model prototype across BrowserWindows
  @modelAction
  getFileBasename() {
    return `${this.shapeName || 'shape'}__${
      tryResolvePath(this, ['texture', 'pattern', 'sourceFileName']) || 'undecorated'}`;
  }

  // TODO: add limits for view scale and
  // these seem like the domain of the texture model but setters for
  // textureScaleDiff (and more to follow) need boundary
  @modelAction
  absoluteMovementToSvg(absCoords) {
    return scalePoint(absCoords, 1 / (this.viewScaleDragged * this.faceFittingScale.scale));
  }

  @modelAction
  translateAbsoluteCoordsToRelative(absCoords) {
    return transformPoint(
      ((new DOMMatrixReadOnly())
        .scale(this.texture.scaleDragged, this.texture.scaleDragged)
        .rotate(this.texture.rotateDragged)
        .inverse()),
      this.absoluteMovementToSvg(absCoords),
    );
  }

  @modelAction
  repositionTextureWithOriginOverPoint(point) {
    if (!this.texture || !this.decorationBoundary) {
      return;
    }
    const originAbsolute = transformPoint(
      this.texture.transformMatrixDragged, this.texture.transform.transformOrigin,
    );
    this.texture.transform.translate = sumPoints(
      this.texture.transform.translate,
      scalePoint(originAbsolute, -1),
      point,
    );
  }

  @modelAction
  repositionTextureWithOriginOverCorner(vertexIndex) {
    this.repositionTextureWithOriginOverPoint(this.decorationBoundary.vertices[vertexIndex]);
  }

  @modelAction
  repositionTextureWithOriginOverFaceCenter() {
    this.repositionTextureWithOriginOverPoint(this.decorationBoundary.centerPoint);
  }

  @modelAction
  repositionSelectedNodeOverPoint(point) {
    if (!this.texture || !this.decorationBoundary) {
      return;
    }
    const svgTextureNode = transformPoint(
      this.texture.transformMatrixDragged, this.selectedTextureNode,
    );
    const diff = sumPoints(svgTextureNode, scalePoint(point, -1));
    this.texture.transform.translate = sumPoints(scalePoint(diff, -1), this.texture.transform.translate);
  }

  @modelAction
  repositionSelectedNodeOverCorner(vertexIndex) {
    this.repositionSelectedNodeOverPoint(this.decorationBoundary.vertices[vertexIndex]);
  }

  @modelAction
  repositionSelectedNodeOverFaceCenter() {
    this.repositionSelectedNodeOverPoint(this.decorationBoundary.centerPoint);
  }

  @modelAction
  repositionOriginOverPoint(point: RawPoint) {
    if (!this.texture || !this.decorationBoundary) {
      return;
    }
    this.repositionOriginOverRelativePoint(transformPoint(this.texture.transform.transformMatrix.inverse(), point));
  }

  @modelAction
  repositionOriginOverRelativePoint(pointRelativeToTexture: RawPoint) {
    const delta = scalePoint(
      sumPoints(scalePoint(pointRelativeToTexture, -1), this.texture.transform.transformOrigin), -1,
    );
    const newTransformOrigin = sumPoints(delta, this.texture.transform.transformOrigin);
    this.texture.transform.translate = sumPoints(
      this.texture.transform.translate,
      scalePoint(calculateTransformOriginChangeOffset(this.texture.transform.transformOrigin, newTransformOrigin,
        this.texture.transform.scale, this.texture.transform.rotate, this.texture.transform.translate), -1),
    );
    this.texture.transform.transformOrigin = newTransformOrigin;
  }

  @modelAction
  repositionOriginOverCorner(vertexIndex) {
    this.repositionOriginOverPoint(this.decorationBoundary.vertices[vertexIndex]);
  }

  @modelAction
  repositionOriginOverFaceCenter() {
    this.repositionOriginOverPoint(this.decorationBoundary.centerPoint);
  }

  @modelAction
  repositionOriginOverTextureCenter() {
    if (this.texture) {
      const { width, height } = this.texture.dimensions;
      this.repositionOriginOverRelativePoint({ x: width / 2, y: height / 2 });
    }
  }

  @modelAction
  sendTextureToDielineEditor() {
    if (!this.texture) { return; }
    this.parentPyramidNetPluginModel.pyramidNetSpec.setTextureFaceDecoration(getSnapshot(this.texture));
  }

  @modelAction
  saveTextureArrangement() {
    if (!this.texture) { return; }
    const fileData = {
      shapeName: this.shapeName,
      textureSnapshot: getSnapshot(this.texture),
    };
    const defaultPath = `${this.shapeName
    }__${this.texture.pattern.sourceFileName}.${TEXTURE_ARRANGEMENT_FILE_EXTENSION}`;
    if (IS_ELECTRON_BUILD) {
      globalThis.ipcRenderer.invoke(EVENTS.DIALOG_SAVE_JSON, fileData, {
        message: 'Save texture arrangement',
        defaultPath,
      }, TEXTURE_ARRANGEMENT_FILE_EXTENSION, specFileExtensionName);
    }
    if (IS_WEB_BUILD) {
      fileDownload(JSON.stringify(fileData), defaultPath, 'application/json');
    }
  }

  @modelAction
  setTextureFromSnapshot(textureSnapshot) {
    this.texture = new TextureModel(textureSnapshot);
  }

  // TODO: ts type the patternInfo
  @modelAction
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
  }

  @modelAction
  setTextureArrangementFromFileData(fileData) {
    const { shapeName, textureSnapshot } = fileData;
    if (!textureSnapshot) {
      return;
    }
    if (shapeName !== this.shapeName) {
      this.parentPyramidNetPluginModel.pyramidNetSpec.setPyramidShapeName(shapeName);
    }
    this.setTextureFromSnapshot(textureSnapshot);
  }

  @modelAction
  async openTextureArrangement() {
    const res = await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_OPEN_JSON, {
      message: 'Import texture arrangement',
    }, TEXTURE_ARRANGEMENT_FILE_EXTENSION, specFileExtensionName);
    // TODO: snackbar error alerts
    if (!res) { return; }

    // @ts-ignore
    const { fileData } = res;
    this.setTextureArrangementFromFileData(fileData);
  }

  onAttachedToRootStore() {
    const SEND_ANALYTICS_INTERVAL_MS = 10000;
    const sendAnaylticsBuffersInterval = setInterval(reportTransformsTally, SEND_ANALYTICS_INTERVAL_MS);
    const vertices = this.parentPyramidNetPluginModel.pyramidNetSpec.normalizedDecorationBoundaryPoints;
    const disposers = [
      reaction(() => [vertices], () => {
        if (vertices) {
          this.decorationBoundary = new BoundaryModel({ vertices });
        }
      }, { fireImmediately: true }),
    ];

    return () => {
      reportTransformsTally();
      clearInterval(sendAnaylticsBuffersInterval);
      for (const disposer of disposers) {
        disposer();
      }
    };
  }
}
