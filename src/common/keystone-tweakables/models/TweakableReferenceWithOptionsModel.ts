import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakableReferenceModel } from './TweakableReferenceModel';
import { createOptionsGetter } from '../util';
import { OptionsListItem, ReferenceWithOptionsMetadata } from '../types';

@model('TweakableReferenceWithOptionsModel')
export class TweakableReferenceWithOptionsModel<T extends object, M extends ReferenceWithOptionsMetadata<T> >
  extends ExtendedModel(<T extends object, M extends ReferenceWithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakableReferenceModel<T, M>>(TweakableReferenceModel),
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
