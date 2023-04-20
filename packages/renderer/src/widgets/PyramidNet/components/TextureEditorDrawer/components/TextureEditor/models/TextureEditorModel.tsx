import { inRange } from 'lodash';
import fileDownload from 'js-file-download';
import {
  findParent, fromSnapshot, getSnapshot, Model, model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { BoundaryModel } from './BoundaryModel';
import { ModifierTrackingModel } from './ModifierTrackingModel';
import {
  calculateTransformOriginChangeOffset,
  RawPoint,
  scalePoint,
  sumPoints,
  transformPoint,
} from '../../../../../../../common/util/geom';
import { rendererContainerContext, ShapePreviewModel } from './ShapePreviewModel';
import { sliderProp } from '../../../../../../../common/keystone-tweakables/props';
import { tryResolvePath } from '../../../../../../../common/util/mobx-keystone';
import {
  DEFAULT_SLIDER_STEP,
  IS_ELECTRON_BUILD,
  IS_WEB_BUILD,
} from '../../../../../../../../../common/constants';
import { reportTransformsTally } from '../../../../../../../common/util/analytics';
import { TransformModel } from '../../../../../models/TransformModel';
import { PyramidNetWidgetModel } from '../../../../../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../../../../../models/ImageFaceDecorationPatternModel';
import { PositionableFaceDecorationModel } from '../../../../../models/PositionableFaceDecorationModel';
import { extractCutHolesFromSvgString } from '../../../../../../../common/util/svg';
import { PathFaceDecorationPatternModel } from '../../../../../models/PathFaceDecorationPatternModel';
import { PatternInfo } from '../../../../../../../../../common/types';
import { electronApi } from '../../../../../../../../../common/electron';

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

@model('TextureEditorModel')
export class TextureEditorModel extends Model({
  viewScale: prop<number>(DEFAULT_VIEW_SCALE),
  shapePreview: prop<ShapePreviewModel | undefined>(),
  modifierTracking: prop<ModifierTrackingModel>(() => new ModifierTrackingModel({})),
  nodeScaleMux: sliderProp(1, {
    labelOverride: 'Node size', min: 0.1, max: 10, step: DEFAULT_SLIDER_STEP,
  }),
}) {
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
  selectedTextureNodeIndex = null;

  @observable
  MIN_VIEW_SCALE = 0.3;

  @observable
  MAX_VIEW_SCALE = 3;

  SEND_ANALYTICS_INTERVAL_MS = 10000;

  @computed
  get parentPyramidNetWidgetModel(): PyramidNetWidgetModel {
    return findParent(this, (parentNode) => parentNode instanceof PyramidNetWidgetModel);
  }

  @computed
  get persistedSpec() {
    return this.parentPyramidNetWidgetModel.persistedSpec;
  }

  // if faceDecoration is Raw before opening texture editor, it is reset to PositionableFaceDecorationModel
  @computed
  get faceDecoration() {
    return this.persistedSpec.faceDecoration as PositionableFaceDecorationModel;
  }

  @computed
  get decorationBoundary() {
    return new BoundaryModel(this.persistedSpec.normalizedDecorationBoundaryPoints);
  }

  @computed
  get shapeName() {
    return this.persistedSpec.pyramid.shapeName;
  }

  @computed
  get imageCoverScale() {
    if (!this.faceDecoration?.pattern) {
      return undefined;
    }
    return getCoverScale(this.decorationBoundary.boundingBoxAttrs, this.faceDecoration.dimensions);
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
    return (this.selectedTextureNodeIndex !== null && this.faceDecoration)
      && this.faceDecoration.destinationPoints[this.selectedTextureNodeIndex];
  }

  // faceBoundary = decorationBoundary + border (if any)
  @computed
  get faceBoundary() {
    if (!this.decorationBoundary || !this.borderToInsetRatio) { return undefined; }
    // TODO: no more dirty type checking
    if (
      this.faceDecoration?.pattern instanceof ImageFaceDecorationPatternModel
      && !this.faceDecoration.pattern.isBordered
    ) {
      return this.decorationBoundary;
    }
    const vertices = this.decorationBoundary.vertices
      .map((pt) => sumPoints(scalePoint(pt, this.borderToInsetRatio), this.insetToBorderOffset));
    return new BoundaryModel(vertices);
  }

  @computed
  get borderToInsetRatio() {
    return this.persistedSpec.borderToInsetRatio;
  }

  @computed
  get insetToBorderOffset() {
    return this.persistedSpec.insetToBorderOffset;
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
    const { dimensions: textureDimensions } = this.faceDecoration;
    if (!this.faceDecoration?.pattern || !this.decorationBoundary) {
      return;
    }
    const { height, width, xmin } = boundingBoxAttrs;
    const { scale, widthIsClamp } = this.imageCoverScale;
    this.faceDecoration.transform = new TransformModel({
      translate: widthIsClamp
        ? { x: xmin, y: (height - (textureDimensions.height * scale)) / 2 }
        : { x: xmin + (width - (textureDimensions.width * scale)) / 2, y: 0 },
      scale,
    });
  }

  @modelAction
  refitTextureToFace() {
    if (this.faceDecoration?.pattern) {
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
  clearTexturePattern() {
    this.faceDecoration.setPattern(undefined);
    this.faceDecoration.setTransform(new TransformModel({}));
  }

  @modelAction
  setTextureFromPattern(pattern) {
    this.resetNodesEditor();
    this.faceDecoration.setPattern(pattern);
    this.fitTextureToFace();
    this.repositionOriginOverFaceCenter();
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
  get fileBasename() {
    return `${this.shapeName.value || 'shape'}__${
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
        .scale(this.faceDecoration.scaleDragged, this.faceDecoration.scaleDragged)
        .rotate(this.faceDecoration.rotateDragged)
        .inverse()),
      this.absoluteMovementToSvg(absCoords),
    );
  }

  @modelAction
  repositionTextureWithOriginOverPoint(point) {
    if (!this.faceDecoration || !this.decorationBoundary) {
      return;
    }
    const originAbsolute = transformPoint(
      this.faceDecoration.transformMatrixDragged, this.faceDecoration.transform.transformOrigin,
    );
    this.faceDecoration.transform.translate = sumPoints(
      this.faceDecoration.transform.translate,
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
    if (!this.faceDecoration || !this.decorationBoundary) {
      return;
    }
    const svgTextureNode = transformPoint(
      this.faceDecoration.transformMatrixDragged, this.selectedTextureNode,
    );
    const diff = sumPoints(svgTextureNode, scalePoint(point, -1));
    this.faceDecoration.transform.translate = sumPoints(scalePoint(diff, -1), this.faceDecoration.transform.translate);
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
    if (!this.faceDecoration || !this.decorationBoundary) {
      return;
    }
    this.repositionOriginOverRelativePoint(
      transformPoint(this.faceDecoration.transform.transformMatrix.inverse(), point),
    );
  }

  @modelAction
  repositionOriginOverRelativePoint(pointRelativeToTexture: RawPoint) {
    const delta = scalePoint(
      sumPoints(scalePoint(pointRelativeToTexture, -1), this.faceDecoration.transform.transformOrigin), -1,
    );
    const {
      transformOrigin, translate, scale, rotate,
    } = this.faceDecoration.transform;
    const newTransformOrigin = sumPoints(delta, transformOrigin);
    this.faceDecoration.transform.translate = sumPoints(
      translate,
      scalePoint(calculateTransformOriginChangeOffset(transformOrigin, newTransformOrigin,
        scale, rotate, translate), -1),
    );
    this.faceDecoration.transform.transformOrigin = newTransformOrigin;
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
    if (this.faceDecoration) {
      const { width, height } = this.faceDecoration.dimensions;
      this.repositionOriginOverRelativePoint({ x: width / 2, y: height / 2 });
    }
  }

  // TODO: although it may be ok to directly edit the dieline texture in the texture editor,
  //  consider using drafts with own history or scope history to on opened state of texture

  @modelAction
  saveTextureArrangement() {
    if (!this.faceDecoration) { return; }
    const fileData = {
      shapeName: this.shapeName.value,
      textureSnapshot: getSnapshot(this.faceDecoration),
    };
    const defaultBasename = `${this.shapeName.value}__${this.faceDecoration.pattern.sourceFileName}`;
    if (IS_ELECTRON_BUILD) {
      electronApi.saveJsonFileWithDialog(
        fileData,
        'Save texture arrangement',
        defaultBasename,
      );
    }
    if (IS_WEB_BUILD) {
      fileDownload(JSON.stringify(fileData), `${defaultBasename}.json`, 'application/json');
    }
  }

  @modelAction
  setTextureFromSnapshot(textureSnapshot) {
    this.persistedSpec.setFaceDecoration(fromSnapshot<PositionableFaceDecorationModel>(textureSnapshot));
  }

  // TODO: ts type the patternInfo
  @modelAction
  assignTextureFromPatternInfo(patternInfo: PatternInfo) {
    if (patternInfo) {
      if (patternInfo.isPath === true) {
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
    if (shapeName !== this.shapeName.value) {
      this.parentPyramidNetWidgetModel.persistedSpec.pyramid.shapeName.setValue(shapeName);
    }
    this.setTextureFromSnapshot(textureSnapshot);
  }

  @modelAction
  async openTextureArrangement() {
    const res = await electronApi.getJsonFromDialog('Import texture arrangement');
    if (res === undefined) { return; }

    const { fileData } = res;
    this.setTextureArrangementFromFileData(fileData);
  }

  @modelAction
  createShapePreview(rendererContainer: HTMLElement) {
    this.shapePreview = rendererContainerContext.apply(() => new ShapePreviewModel({}), rendererContainer);
  }

  onAttachedToRootStore() {
    const sendAnalyticsBuffersInterval = setInterval(reportTransformsTally, this.SEND_ANALYTICS_INTERVAL_MS);

    return () => {
      reportTransformsTally();
      clearInterval(sendAnalyticsBuffersInterval);
    };
  }
}
