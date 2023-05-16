import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakableReferenceModel } from './TweakableReferenceModel';
import { createOptionsGetter } from '../util';
import { OptionsListItem, ReferenceWithOptionsMetadata } from '../types';

// NOTE: controls depend on reference models having a defined id via getRefId
@model('SvgWidgetStudio/TweakableReferenceWithOptionsModel')
export class TweakableReferenceWithOptionsModel<T extends object, M extends ReferenceWithOptionsMetadata<T> >
  extends ExtendedModel(<T extends object, M extends ReferenceWithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakableReferenceModel<T, M>>(TweakableReferenceModel),
    props: {},
  }))<T, M> {
  readonly options: OptionsListItem<T>[] | undefined;

  onAttachedToRootStore(rootStore) {
    createOptionsGetter(this, rootStore);

    if (this.value === undefined && this.metadata.initialSelectionResolver !== undefined) {
      const value = this.metadata.initialSelectionResolver(this.options.map(({ value }) => value), rootStore);
      if (value) {
        this.valueRef = this.metadata.typeRef(value);
      }
    }
    super.onAttachedToRootStore(rootStore);
  }
}
