import { Model, model, prop } from 'mobx-keystone';
import { computed } from 'mobx';
import { RawPoint } from '@/common/PathData/types';
import { TransformObject } from 'svg-path-commander';
import { convertTransformObjectToDOMMatrixReadOnly } from '@/common/PathData/helpers';

@model('TransformModel')
export class TransformModel extends Model({
  translate: prop<RawPoint>(() => ({ x: 0, y: 0 })).withSetter(),
  scale: prop<number>(1).withSetter(),
  rotate: prop<number>(0).withSetter(),
  transformOrigin: prop<RawPoint>(() => ({ x: 0, y: 0 })).withSetter(),
}) {
  @computed
  get transformMatrix() {
    return convertTransformObjectToDOMMatrixReadOnly(this.transformObject);
  }

  @computed
  get transformObject(): Partial<TransformObject> {
    const {
      transformOrigin: { x: ox, y: oy }, scale, rotate, translate: { x: tx, y: ty },
    } = this;
    return {
      origin: [ox, oy], scale, translate: [tx, ty], rotate,
    };
  }
}
