import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakablePrimitiveModel } from './TweakablePrimitiveModel';
import { createOptionsGetter } from '../internal/tweakables';
import { stringifier } from '../internal/util';
import { WithOptionsMetadata } from '../types';

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
