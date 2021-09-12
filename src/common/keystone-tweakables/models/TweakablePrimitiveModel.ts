import {
  getRootPath, Model, model, modelAction, prop,
} from 'mobx-keystone';
import { computed } from 'mobx';
import { ownPropertyName, resolveLabel } from '../util';
import { propertyMetadataCtx, propertyMetadataRegistry } from '../data';
import { PrimitiveMetadata } from '../types';

@model('TweakablePrimitiveModel')// eslint-disable-next-line @typescript-eslint/no-shadow
export class TweakablePrimitiveModel<T, M extends PrimitiveMetadata> extends Model(<T>() => ({
  value: prop<T>()
    .withSetter(),
}))<T> {
  private defaultValue: T | undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAttachedToRootStore(rootStore) {
    // undefined when applying snapshot
    const metadataFromContext = propertyMetadataCtx.get(this);
    if (metadataFromContext) {
      propertyMetadataRegistry.set(this.valuePath, propertyMetadataCtx.get(this));
    }
  }

  @modelAction
  reset() {
    this.value = this.defaultValue;
  }

  @computed
  get metadata(): M {
    return propertyMetadataRegistry.get(this.valuePath) as M;
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
}
