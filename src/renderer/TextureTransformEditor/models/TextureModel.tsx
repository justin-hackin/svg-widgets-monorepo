import { Instance, getParentOfType } from 'mobx-state-tree';
// @ts-ignore

import { FaceDecorationModel } from '../../DielineViewer/models/PyramidNetStore';
import { getDimensionsFromPathD } from '../../../common/util/svg';
import { PathData } from '../../DielineViewer/util/PathData';
// eslint-disable-next-line import/no-cycle
import { TextureTransformEditorModel } from './TextureTransformEditorModel';
import {
  calculateTransformOriginChangeOffset, getOriginPoint,
  getTextureTransformMatrix,
  scalePoint,
  sumPoints,
} from '../../common/util/geom';

const negativeMod = (n, m) => ((n % m) + m) % m;
const wrapDegrees = (deg) => negativeMod(deg, 360);

const transformDiffDefaults = {
  translateDiff: getOriginPoint(),
  rotateDiff: 0,
  scaleDiff: 1,
  transformOriginDiff: getOriginPoint(),
};

export const TextureModel = FaceDecorationModel
  .volatile(() => ({ ...transformDiffDefaults }))
  .views((self) => ({
    get dimensions() {
      return getDimensionsFromPathD(self.pathD);
    },
    get transformOriginDragged() {
      return sumPoints(self.transformOrigin, self.transformOriginDiff);
    },
    get translateDragged() {
      return sumPoints(self.translate, self.translateDiff);
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
    get destinationPoints() {
      return (new PathData(self.pathD)).getDestinationPoints();
    },
    get parentHistoryManager() {
      return getParentOfType(self, TextureTransformEditorModel).history;
    },
  }))
  .actions((self) => ({
    setScaleDiff(mux) {
      self.parentHistoryManager.withoutUndo(() => {
        self.scaleDiff = mux;
      });
    },
    reconcileScaleDiff() {
      self.scale *= self.scaleDiff;
      self.scaleDiff = 1;
    },
    setTranslateDiff(delta) {
      self.parentHistoryManager.withoutUndo(() => {
        self.translateDiff = delta;
      });
    },
    reconcileTranslateDiff() {
      self.translate = sumPoints(self.translate, self.translateDiff);
      self.translateDiff = getOriginPoint();
    },
    setRotate(rotate) {
      self.rotate = rotate;
    },
    setRotateDiff(delta) {
      self.parentHistoryManager.withoutUndo(() => {
        self.rotateDiff = delta;
      });
    },
    reconcileRotateDiff() {
      self.rotate = wrapDegrees(self.rotate + self.rotateDiff);
      self.rotateDiff = 0;
    },
    setTransformOriginDiff(delta) {
      self.parentHistoryManager.withoutUndo(() => {
        self.transformOriginDiff = delta;
      });
    },
    reconcileTransformOriginDiff() {
      const relativeDifference = calculateTransformOriginChangeOffset(
        self.transformOrigin, self.transformOriginDragged,
        self.scaleDragged, self.rotateDragged, self.translateDragged,
      );
      self.transformOrigin = self.transformOriginDragged;
      self.translate = sumPoints(self.translate, scalePoint(relativeDifference, -1));
      self.transformOriginDiff = getOriginPoint();
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
