import {
  getRootPath, Model, model, modelAction, prop, Ref,
} from 'mobx-keystone';
import { computed } from 'mobx';
import { propertyMetadataCtx, propertyMetadataRegistry } from '../data';
import { ownPropertyName, resolveLabel } from '../util';
import { ReferenceMetadata } from '../types';

@model('ControllableReferenceModel')
export class ControllableReferenceModel<T extends object, M extends ReferenceMetadata> extends Model(
  <T extends object>() => ({ valueRef: prop<Ref<T> | undefined>() }),
)<T> {
  // since applying a snapshot will detach this node and construct a new one, transfer metadata to store
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAttachedToRootStore(rootStore) {
    // undefined when applying snapshot
    const metadataFromContext = propertyMetadataCtx.get(this);
    if (metadataFromContext) {
      propertyMetadataRegistry.set(this.valuePath, propertyMetadataCtx.get(this));
    }
  }

  @computed
  get metadata(): M {
    return propertyMetadataRegistry.get(this.valuePath) as M;
  }

  @computed
  get value() {
    return this.valueRef?.current;
  }

  @modelAction
  setValue(modelValue: T) {
    this.valueRef = this.metadata.typeRef(modelValue);
  }

  // a bit un-DRY
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
