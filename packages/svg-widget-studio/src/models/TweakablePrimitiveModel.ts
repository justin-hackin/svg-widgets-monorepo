import {
  getRootPath, Model, model, modelAction, prop,
} from 'mobx-keystone';
import { computed, observable } from 'mobx';
import { ownPropertyName, resolveLabel } from '../internal/tweakables';
import { propertyMetadataCtx } from '../internal/data';

import type { PrimitiveMetadata } from '../types';

@model('SvgWidgetStudio/TweakablePrimitiveModel')
export class TweakablePrimitiveModel<T, M extends PrimitiveMetadata> extends Model(<T>() => ({
  value: prop<T>().withSetter(),
}))<T> {
  // helps prevent controls from being rendered before onAttachedToRootStore has a chance to set up metadata getters
  @observable
    onAttachedComplete = false;

  // @ts-ignore because defined in onInit
  private defaultValue: T;

  onInit() {
    this.defaultValue = this.value;
  }

  @modelAction
  reset() {
    this.setValue(this.defaultValue);
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
