import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { stringifier } from '@/common/util/data';
import { TweakablePrimitiveModel } from './TweakablePrimitiveModel';
import { createOptionsGetter } from '../util';
import type { WithOptionsMetadata } from '../types';

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

  onAttachedToRootStore(rootStore) {
    if (this.metadata.initialSelectionResolver) {
      const resolvedInitialSelection = this.metadata.initialSelectionResolver(this.options);
      this.setValue(resolvedInitialSelection);
    }
    super.onAttachedToRootStore(rootStore);
  }
}
