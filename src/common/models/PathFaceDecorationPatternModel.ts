import { prop, model, Model } from 'mobx-keystone';

@model('PathFaceDecorationPatternModel')
export class PathFaceDecorationPatternModel extends Model({
  pathD: prop<string>(),
  sourceFileName: prop<string>(),
  isPositive: prop<boolean>().withSetter(),
  useAlphaTexturePreview: prop(true).withSetter(),
}) {}
