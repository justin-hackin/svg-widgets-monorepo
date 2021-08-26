// from texture editor send
import { getType, Instance, types } from 'mobx-state-tree';
import { PathFaceDecorationPatternModel } from '../../../common/models/PathFaceDecorationPatternModel';
import { ImageFaceDecorationPatternModel } from '../../../common/models/ImageFaceDecorationPatternModel';
import { getTextureTransformMatrix, RawPoint } from '../../../common/util/geom';

export const TextureFaceDecorationModel = types.model('TextureFaceDecorationModel', {
  pattern: types.union(PathFaceDecorationPatternModel, ImageFaceDecorationPatternModel),
  transformOrigin: types.frozen<RawPoint>(),
  translate: types.frozen<RawPoint>(),
  rotate: types.number,
  scale: types.number,
})
  .views((self) => ({
    get transformMatrix() {
      const {
        transformOrigin,
        rotate,
        scale,
        translate,
      } = self;
      return getTextureTransformMatrix(transformOrigin, scale, rotate, translate);
    },
    get hasPathPattern() {
      return getType(self.pattern) === PathFaceDecorationPatternModel;
    },
  }));

export interface ITextureFaceDecorationModel extends Instance<typeof TextureFaceDecorationModel> {
}
