import {
  getRootPath, Model, model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { ownPropertyName, resolveLabel } from '../util';
import { propertyMetadataCtx } from '../data';
import { PrimitiveMetadata } from '../types';

@model('TweakablePrimitiveModel')// eslint-disable-next-line @typescript-eslint/no-shadow
export class TweakablePrimitiveModel<T, M extends PrimitiveMetadata> extends Model(<T>() => ({
  value: prop<T>()
    .withSetter(),
}))<T> {
  // helps prevent controls from being rendered before onAttachedToRootStore has a chance to set up metadata getters
  @observable
  onAttachedComplete = false;

  private defaultValue: T | undefined;

  @modelAction
  reset() {
    this.value = this.defaultValue;
  }

  @computed
  get metadata(): M {
    return propertyMetadataCtx.get(this) as M;
  }

  @computed
  get ownPropertyName() {
    return ownPropertyName(this);
  }

  @computed
  get label(): string {
    return resolveLabel(this);
  }

  @computed
  get valuePath() {
    return getRootPath(this)
      .path
      .join('/');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAttachedToRootStore(rootStore) {
    this.onAttachedComplete = true;
  }
}
