import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakablePrimitiveModel } from './TweakablePrimitiveModel';
import { createOptionsGetter } from '../util';
import { OptionsListItem, WithOptionsMetadata } from '../types';

@model('TweakablePrimitiveWithOptionsModel')
export class TweakablePrimitiveWithOptionsModel<T, M extends WithOptionsMetadata<T>>
  extends ExtendedModel(<T, M extends WithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakablePrimitiveModel<T, M>>(TweakablePrimitiveModel),
    props: {},
  }))<T, M> {
  readonly options: OptionsListItem<T>[] | undefined;

  // @ts-ignore
  onAttachedToRootStore(rootStore) {
    createOptionsGetter(this, rootStore);
  }
}
