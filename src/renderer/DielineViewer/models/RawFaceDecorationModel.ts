// from file menu template upload
import { Model, model, prop } from 'mobx-keystone';

@model('RawFaceDecorationModel')
export class RawFaceDecorationModel extends Model({
  dValue: prop<string>(),
}) {}
