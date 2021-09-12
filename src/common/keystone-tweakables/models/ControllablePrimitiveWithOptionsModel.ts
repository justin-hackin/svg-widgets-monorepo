import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { ControllablePrimitiveModel } from './ControllablePrimitiveModel';
import { createOptionsGetter } from '../util';
import { OptionsListItem, WithOptionsMetadata } from '../types';

@model('ControllablePrimitiveWithOptionsModel')
export class ControllablePrimitiveWithOptionsModel<T, M extends WithOptionsMetadata<T>>
  extends ExtendedModel(<T, M extends WithOptionsMetadata<T>>() => ({
    baseModel: modelClass<ControllablePrimitiveModel<T, M>>(ControllablePrimitiveModel),
    props: {},
  }))<T, M> {
  readonly options: OptionsListItem<T>[] | undefined;

  // @ts-ignore
  onAttachedToRootStore(rootStore) {
    super.onAttachedToRootStore(rootStore);
    createOptionsGetter(this, rootStore);
  }
}
