import { Model, model, prop } from 'mobx-keystone';

@model('DimensionsModel')
export class DimensionsModel extends Model({
  width: prop<number>(),
  height: prop<number>(),
}) {}
