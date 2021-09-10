import uuid from 'uuid/v1';

import { computed } from 'mobx';
import {
  createContext,
  ExtendedModel,
  getRootPath,
  model,
  Model,
  modelAction,
  modelClass,
  Path,
  prop,
  Ref,
  RefConstructor,
} from 'mobx-keystone';

import { ownPropertyName, tryResolvePath } from './mobx-keystone';
import { labelOverride, resolveLabel } from './label';

export enum INPUT_TYPE {
  SLIDER = 'slider',
  SWITCH = 'switch',
  COLOR_PICKER = 'color-picker',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
  NUMBER_TEXT = 'number-text',
}

interface BasePrimitiveMetadata {
  type: INPUT_TYPE,
  labelOverride?: labelOverride,
}

export interface SliderMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SLIDER,
  min: number,
  max: number,
  step: number,
}

export interface SwitchMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SWITCH,
}

export interface ColorPickerMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.COLOR_PICKER,
}

interface OptionsListItem {
  value: string,
  label?: string,
}

export interface RadioMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.RADIO,
  options: OptionsListItem[],
  isRow?: boolean,
}

export interface NumberTextMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.NUMBER_TEXT,
  useUnits?: boolean,
}

export type PrimitiveMetadata =
  SliderMetadata | SwitchMetadata | ColorPickerMetadata | RadioMetadata | NumberTextMetadata;
export type ReferenceMetadata = DropdownReferenceMetadata<any>;
export type AnyMetadata = PrimitiveMetadata | ReferenceMetadata;
export type ControllableModel =
  ControllablePrimitiveModel<any, PrimitiveMetadata> | ControllableReferenceModel<any, ReferenceMetadata>;

const propertyMetadata = createContext<AnyMetadata>();

@model('ControllablePrimitiveModel')// eslint-disable-next-line @typescript-eslint/no-shadow
export class ControllablePrimitiveModel<T, M extends PrimitiveMetadata> extends Model(<T>() => ({
  value: prop<T>().withSetter(),
}))<T> {
  private defaultValue;

  onInit() {
    this.defaultValue = this.value;
  }

  @modelAction
  reset() {
    this.value = this.defaultValue;
  }

  @computed
  get metadata():M {
    return propertyMetadata.get(this) as M;
  }

  @computed
  get ownPropertyName() {
    return ownPropertyName(this);
  }

  @computed
  get label():string {
    return resolveLabel(this);
  }

  @computed
  get valuePath() {
    return getRootPath(this).path.join('/');
  }
}

export function controllablePrimitiveProp<T, M extends PrimitiveMetadata>(value:T, metadata: M) {
  return prop<ControllablePrimitiveModel<T, M>>(() => propertyMetadata.apply(
    () => new ControllablePrimitiveModel<T, M>({ value, $modelId: uuid() }), metadata,
  ));
}

export const sliderProp = (
  value: number, metadata: Omit<SliderMetadata, 'type'>,
) => controllablePrimitiveProp<number, SliderMetadata>(
  value, { type: INPUT_TYPE.SLIDER, ...metadata },
);

export const switchProp = (value: boolean) => controllablePrimitiveProp<boolean, SwitchMetadata>(
  value, { type: INPUT_TYPE.SWITCH },
);

export const colorPickerProp = (value: string) => controllablePrimitiveProp<string, ColorPickerMetadata>(
  value, { type: INPUT_TYPE.COLOR_PICKER },
);

export const radioProp = (
  value: string, metadata: Omit<RadioMetadata, 'type'>,
) => controllablePrimitiveProp<string, RadioMetadata>(
  value, { type: INPUT_TYPE.RADIO, ...metadata },
);

// TODO: consider default label override + context for units on label
export const numberTextProp = (
  value: number, metadata?: Omit<NumberTextMetadata, 'type'>,
) => controllablePrimitiveProp<number, NumberTextMetadata>(
  value, { type: INPUT_TYPE.NUMBER_TEXT, ...metadata },
);

export interface ReferenceOptionEntry<T> {
  value: T,
  label: string,
}

interface DropdownReferenceMetadata<T extends object> {
  type: INPUT_TYPE.DROPDOWN,
  initialValueIndex?: number,
  pathToOptions: Path,
  optionLabeler: (option: T) => string,
  typeRef: RefConstructor<T>,
  labelOverride?: labelOverride,
}

@model('ControllableReferenceModel')
export class ControllableReferenceModel<T extends object, M extends ReferenceMetadata> extends Model(
  <T extends object>() => ({ valueRef: prop<Ref<T> | undefined>() }),
)<T> {
  @computed
  get metadata():M {
    return propertyMetadata.get(this) as M;
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
  get label():string {
    return resolveLabel(this);
  }

  @computed
  get valuePath() {
    return getRootPath(this).path.join('/');
  }
}

@model('ControllableDropdownReferenceModel')
export class ControllableDropdownReferenceModel<T extends object, M extends DropdownReferenceMetadata<T>> extends
  ExtendedModel(<T extends object, M extends DropdownReferenceMetadata<T>>() => ({
    baseModel: modelClass<ControllableReferenceModel<T, M>>(ControllableReferenceModel),
    props: {},
  }))<T, M> {
  private optionsCtx = createContext<ReferenceOptionEntry<T>[] | undefined>();

  onAttachedToRootStore(rootStore) {
    this.optionsCtx.setComputed(this, () => {
      // TODO: consider run time type checks for the options found by pathToOptions, type is uncertain
      const resolvedPath = tryResolvePath<T[]>(rootStore, this.metadata.pathToOptions);
      if (!resolvedPath) { throw new Error('ControllableDropdownReferenceModel failed to resolve pathToOptions'); }
      return resolvedPath.map((option: T) => ({ value: option, label: this.metadata.optionLabeler(option) }));
    });
    if (this.metadata.initialValueIndex !== undefined) {
      const options = this.optionsCtx.get(this);
      if (options) {
        this.valueRef = this.metadata.typeRef(options[this.metadata.initialValueIndex].value);
      }
    }
  }

  @computed
  get options():ReferenceOptionEntry<T>[] {
    return this.optionsCtx.get(this);
  }
}

export function referenceDropdownProp<T extends object>(metadata: Omit<DropdownReferenceMetadata<T>, 'type'>) {
  return prop<ControllableDropdownReferenceModel<T, DropdownReferenceMetadata<T>>>(() => propertyMetadata.apply(
    () => new ControllableDropdownReferenceModel<T, DropdownReferenceMetadata<T>>({}), {
      type: INPUT_TYPE.DROPDOWN, ...metadata,
    },
  ));
}
