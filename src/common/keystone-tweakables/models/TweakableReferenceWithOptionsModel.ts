import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { stringifier } from '@/common/util/data';
import { TweakableReferenceModel } from './TweakableReferenceModel';
import { createOptionsGetter } from '../util';
import { ReferenceWithOptionsMetadata } from '../types';

// NOTE: controls depend on reference models having a defined id via getRefId
@model('SvgWidgetStudio/TweakableReferenceWithOptionsModel')
export class TweakableReferenceWithOptionsModel<T extends object, M extends ReferenceWithOptionsMetadata<T> >
  extends ExtendedModel(<T extends object, M extends ReferenceWithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakableReferenceModel<T, M>>(TweakableReferenceModel),
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
      this.setValueRef(this.metadata.typeRef(resolvedInitialSelection));
    }
    super.onAttachedToRootStore(rootStore);
  }
}
