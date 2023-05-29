import { ExtendedModel, model, modelClass } from 'mobx-keystone';
import { TweakableReferenceModel } from './TweakableReferenceModel';
import { createOptionsGetter } from '../internal/tweakables';
import { stringifier } from '../internal/util';
import type { ReferenceWithOptionsMetadata } from '../types';

// NOTE: controls depend on reference models having a defined id via getRefId
@model('SvgWidgetStudio/TweakableReferenceWithOptionsModel')
export class TweakableReferenceWithOptionsModel<T extends object, M extends ReferenceWithOptionsMetadata<T> >
  extends ExtendedModel(<T extends object, M extends ReferenceWithOptionsMetadata<T>>() => ({
    baseModel: modelClass<TweakableReferenceModel<T, M>>(TweakableReferenceModel),
    props: {},
  }))<T, M> {
  readonly options: T[] | undefined;

  get optionLabelMap() {
    return this.metadata?.optionLabelMap || stringifier;
  }

  onInit() {
    createOptionsGetter(this);
  }
}
