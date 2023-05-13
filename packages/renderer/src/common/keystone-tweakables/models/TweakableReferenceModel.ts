import {
  getRootPath, Model, model, modelAction, prop, Ref,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { propertyMetadataCtx } from '../data';
import { ownPropertyName, resolveLabel } from '../util';
import { ReferenceMetadata } from '../types';

@model('TweakableReferenceModel')
export class TweakableReferenceModel<T extends object, M extends ReferenceMetadata> extends Model(
  <T extends object>() => ({ valueRef: prop<Ref<T> | undefined>().withSetter() }),
)<T> {
  // helps prevent controls from being rendered before onAttachedToRootStore has a chance to set up metadata getters
  @observable
    onAttachedComplete = false;

  @computed
  get metadata(): M {
    return propertyMetadataCtx.get(this) as M;
  }

  @computed
  get value() {
    return this.valueRef?.current;
  }

  @modelAction
  setValue(modelValue: T) {
    this.setValueRef(this.metadata.typeRef(modelValue));
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAttachedToRootStore(rootStore) {
    this.onAttachedComplete = true;
  }
}
