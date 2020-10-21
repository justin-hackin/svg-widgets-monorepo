import { Instance } from 'mobx-state-tree';

import { FaceDecorationModel } from '../../DielineViewer/models/PyramidNetStore';
import {
  addTuple,
  calculateTransformOriginChangeOffset,
  getTextureTransformMatrix,
  negateMap,
} from '../../common/util/2d-transform';
import { getDimensionsFromPathD } from '../../../common/util/svg';

const negativeMod = (n, m) => ((n % m) + m) % m;
const wrapDegrees = (deg) => negativeMod(deg, 360);

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
      return getDimensionsFromPathD(self.pathD);
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
