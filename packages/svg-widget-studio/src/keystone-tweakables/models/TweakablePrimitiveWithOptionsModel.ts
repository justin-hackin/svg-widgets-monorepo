import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakablePrimitiveModel } from './TweakablePrimitiveModel';
import { createOptionsGetter } from '../util';
import type { WithOptionsMetadata } from '../types';
import { stringifier } from '../../internal/util';

@model('SvgWidgetStudio/TweakablePrimitiveWithOptionsModel')
export class TweakablePrimitiveWithOptionsModel<T, M extends WithOptionsMetadata<T>>
  extends ExtendedModel(<T, M extends WithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakablePrimitiveModel<T, M>>(TweakablePrimitiveModel),
    props: {},
  }))<T, M> {
  readonly options: T[] | undefined;

  get optionLabelMap() {
    return this.metadata?.optionLabelMap || stringifier;
  }

  onInit() {
    createOptionsGetter(this);
  }
}
