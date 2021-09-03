import { Model, model, prop } from 'mobx-keystone';
import { computed } from 'mobx';
import { getTextureTransformMatrix, RawPoint } from '../util/geom';

@model('TransformModel')
export class TransformModel extends Model({
  translate: prop<RawPoint>(() => ({ x: 0, y: 0 })).withSetter(),
  scale: prop<number>(1).withSetter(),
  rotate: prop<number>(0).withSetter(),
  transformOrigin: prop<RawPoint>(() => ({ x: 0, y: 0 })).withSetter(),
}) {
  @computed
  get transformMatrix() {
    const {
      transformOrigin,
      rotate,
      scale,
      translate,
    } = this;
    return getTextureTransformMatrix(transformOrigin, scale, rotate, translate);
  }
}
