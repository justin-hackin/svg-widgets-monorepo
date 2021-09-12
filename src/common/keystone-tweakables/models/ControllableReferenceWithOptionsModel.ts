import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { ControllableReferenceModel } from './ControllableReferenceModel';
import { createOptionsGetter } from '../util';
import { OptionsListItem, ReferenceWithOptionsMetadata } from '../types';

@model('ControllableReferenceWithOptionsModel')
export class ControllableReferenceWithOptionsModel<T extends object, M extends ReferenceWithOptionsMetadata<T> >
  extends ExtendedModel(<T extends object, M extends ReferenceWithOptionsMetadata<T>>() => ({
    baseModel: modelClass<ControllableReferenceModel<T, M>>(ControllableReferenceModel),
    props: {},
  }))<T, M> {
  readonly options: OptionsListItem<T>[] | undefined;

  onAttachedToRootStore(rootStore) {
    super.onAttachedToRootStore(rootStore);
    createOptionsGetter(this, rootStore);

    if (this.metadata.initialSelectionResolver !== undefined) {
      const value = this.metadata.initialSelectionResolver(this.options.map(({ value }) => value), rootStore);
      if (value) {
        this.valueRef = this.metadata.typeRef(value);
      }
    }
  }
}
