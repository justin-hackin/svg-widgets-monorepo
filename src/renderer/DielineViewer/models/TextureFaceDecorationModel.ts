// from texture editor send
import { Model, model, prop } from 'mobx-keystone';

import { PathFaceDecorationPatternModel } from '../../../common/models/PathFaceDecorationPatternModel';
import { ImageFaceDecorationPatternModel } from '../../../common/models/ImageFaceDecorationPatternModel';
import { TransformModel } from '../../../common/models/TransformModel';

@model('TextureFaceDecorationModel')
export class TextureFaceDecorationModel extends Model({
  pattern: prop<PathFaceDecorationPatternModel | ImageFaceDecorationPatternModel>(),
  transform: prop<TransformModel>(() => (new TransformModel({}))),
}) {}
