// from texture editor send
import {
  Model, model, modelAction, prop,
} from 'mobx-keystone';

import { computed, observable } from 'mobx';
import { getDimensionsFromPathD } from '../../../common/util/svg';
import {
  calculateTransformOriginChangeOffset,
  getOriginPoint,
  getTextureTransformMatrix, scalePoint,
  sumPoints,
} from '../../../common/util/geom';
import { getNearestHistoryFromAncestorNode } from '../../../common/util/mobx-keystone';
import { TransformModel } from './TransformModel';
import { ImageFaceDecorationPatternModel } from './ImageFaceDecorationPatternModel';
import { PathFaceDecorationPatternModel } from './PathFaceDecorationPatternModel';
import { PathData } from '../../../common/path/PathData';

// TODO: move to util
const negativeMod = (n, m) => ((n % m) + m) % m;
const wrapDegrees = (deg) => negativeMod(deg, 360);

@model('PositionableFaceDecorationModel')
export class PositionableFaceDecorationModel extends Model({
  pattern: prop<PathFaceDecorationPatternModel | ImageFaceDecorationPatternModel | undefined>(
    () => undefined,
  ).withSetter(),
  transform: prop<TransformModel>(() => (new TransformModel({}))).withSetter(),
}) {
  @observable
    transformDiff = new TransformModel({});

  @computed
  get dimensions() {
    if (!this.pattern) { return undefined; }
    if (this.pattern instanceof PathFaceDecorationPatternModel) {
      const { pathD } = this.pattern as PathFaceDecorationPatternModel;
      return getDimensionsFromPathD(pathD);
    }
    if (this.pattern instanceof ImageFaceDecorationPatternModel) {
      const { dimensions } = this.pattern as ImageFaceDecorationPatternModel;
      return dimensions;
    }
    throw new Error('unexpected pattern type');
  }

  @computed
  get transformOriginDragged() {
    return sumPoints(this.transform.transformOrigin, this.transformDiff.transformOrigin);
  }

  @computed
  get translateDragged() {
    return sumPoints(this.transform.translate, this.transformDiff.translate);
  }

  @computed
  get rotateDragged() {
    return wrapDegrees(this.transform.rotate + this.transformDiff.rotate);
  }

  @computed
  get scaleDragged() {
    return this.transform.scale * this.transformDiff.scale;
  }

  @computed
  get transformMatrixDragged() {
    return getTextureTransformMatrix(
      this.transform.transformOrigin,
      this.scaleDragged,
      this.rotateDragged,
      this.translateDragged,
    );
  }

  @computed
  get transformMatrixDraggedStr() {
    return this.transformMatrixDragged && this.transformMatrixDragged.toString();
  }

  @computed
  get destinationPoints() {
    if (this.pattern instanceof PathFaceDecorationPatternModel) {
      const { pathD } = this.pattern as PathFaceDecorationPatternModel;
      return (new PathData(pathD)).getDestinationPoints();
    }
    return null;
  }

  @computed
  get parentHistoryManager() {
    return getNearestHistoryFromAncestorNode(this);
  }

  @modelAction
  setScaleDiff(mux) {
    this.parentHistoryManager.withoutUndo(() => {
      this.transformDiff.scale = mux;
    });
  }

  @modelAction
  reconcileScaleDiff() {
    this.transform.scale *= this.transformDiff.scale;
    this.transformDiff.scale = 1;
  }

  @modelAction
  setTranslateDiff(delta) {
    this.parentHistoryManager.withoutUndo(() => {
      this.transformDiff.translate = delta;
    });
  }

  @modelAction
  reconcileTranslateDiff() {
    this.transform.translate = sumPoints(this.transform.translate, this.transformDiff.translate);
    this.transformDiff.translate = getOriginPoint();
  }

  @modelAction
  setRotateDiff(delta) {
    this.parentHistoryManager.withoutUndo(() => {
      this.transformDiff.rotate = delta;
    });
  }

  @modelAction
  reconcileRotateDiff() {
    this.transform.rotate = wrapDegrees(this.transform.rotate + this.transformDiff.rotate);
    this.transformDiff.rotate = 0;
  }

  @modelAction
  setTransformOriginDiff(delta) {
    this.parentHistoryManager.withoutUndo(() => {
      this.transformDiff.transformOrigin = delta;
    });
  }

  @modelAction
  reconcileTransformOriginDiff() {
    const relativeDifference = calculateTransformOriginChangeOffset(
      this.transform.transformOrigin,
      this.transformOriginDragged,
      this.scaleDragged,
      this.rotateDragged,
      this.translateDragged,
    );
    this.transform.transformOrigin = this.transformOriginDragged;
    this.transform.translate = sumPoints(this.transform.translate, scalePoint(relativeDifference, -1));
    this.transformDiff.transformOrigin = getOriginPoint();
  }
}
