import {
  prop, model, Model,
} from 'mobx-keystone';
import { DimensionsModel } from './DimensionsModel';

@model('ImageFaceDecorationPatternModel')
export class ImageFaceDecorationPatternModel extends Model({
  imageData: prop<string>(),
  dimensions: prop<DimensionsModel>(),
  sourceFileName: prop<string>(),
  isBordered: prop(true).withSetter(),
}) {}
