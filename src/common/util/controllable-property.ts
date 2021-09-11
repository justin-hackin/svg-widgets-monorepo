import uuid from 'uuid/v1';
import { isFunction } from 'lodash';
import { computed, makeObservable } from 'mobx';
import {
  createContext,
  ExtendedModel,
  getRootPath,
  model,
  Model,
  modelAction,
  modelClass,
  prop,
  Ref,
  RefConstructor,
} from 'mobx-keystone';
import { ownPropertyName } from './mobx-keystone';
import { labelOverride, resolveLabel } from './label';

export enum INPUT_TYPE {
  SLIDER = 'slider',
  SWITCH = 'switch',
  COLOR_PICKER = 'color-picker',
  RADIO = 'radio',
  SELECT = 'select',
  REFERENCE_SELECT = 'reference-select',
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

interface OptionsListItem<T> {
  value: T,
  label?: string,
}
type OptionsListResolverFactory<T> = (rootStore: object) => (() => OptionsListItem<T>[]);

type MetadataOptions<T> = OptionsListItem<T>[] | OptionsListResolverFactory<T>;

function optionsIsListResolver<T>(
  options: MetadataOptions<T>,
): options is OptionsListResolverFactory<T> {
  return isFunction(options);
}

export interface RadioMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.RADIO,
  options: OptionsListItem<T>[] | OptionsListResolverFactory<T>,
  isRow?: boolean,
}

export interface SelectMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SELECT,
  options: OptionsListItem<T>[],
}

type WithOptionsMetadata<T> = SelectMetadata<T> | RadioMetadata<T>;

export interface NumberTextMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.NUMBER_TEXT,
  useUnits?: boolean,
}

export type PrimitiveMetadata =
  SliderMetadata | SwitchMetadata | ColorPickerMetadata | RadioMetadata<any> | NumberTextMetadata | SelectMetadata<any>;
export type ReferenceMetadata = ReferenceSelectMetadata<any>;
export type AnyMetadata = PrimitiveMetadata | ReferenceMetadata;
export type ControllableModel =
  ControllablePrimitiveModel<any, PrimitiveMetadata> | ControllableReferenceModel<any, ReferenceMetadata>;

const propertyMetadataRegistry = new Map<string, AnyMetadata>();

const propertyMetadata = createContext<AnyMetadata>();

@model('ControllablePrimitiveModel')// eslint-disable-next-line @typescript-eslint/no-shadow
export class ControllablePrimitiveModel<T, M extends PrimitiveMetadata> extends Model(<T>() => ({
  value: prop<T>().withSetter(),
}))<T> {
  private defaultValue: T | undefined;

  onAttachedToRootStore(rootStore) {
    // undefined when applying snapshot
    const metadataFromContext = propertyMetadata.get(this);
    if (metadataFromContext) {
      propertyMetadataRegistry.set(this.valuePath, propertyMetadata.get(this));
    }
  }

  @modelAction
  reset() {
    this.value = this.defaultValue;
  }

  @computed
  get metadata():M {
    return propertyMetadataRegistry.get(this.valuePath) as M;
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

function createOptionsGetter(
  node: ControllablePrimitiveWithOptionsModel<any, any> | ControllableReferenceWithOptionsModel<any, any>,
  rootStore: object,
) {
  Object.defineProperty(node, 'options', {
    get: optionsIsListResolver(node.metadata.options) ? node.metadata.options(rootStore) : () => node.metadata.options,
    configurable: true,
  });
  makeObservable(node, { options: computed });
}

@model('ControllablePrimitiveWithOptionsModel')
export class ControllablePrimitiveWithOptionsModel<T, M extends WithOptionsMetadata<T>> extends
  ExtendedModel(<T, M extends WithOptionsMetadata<T>>() => ({
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

function controllablePrimitiveWithOptionsProp<T, M extends WithOptionsMetadata<T>>(
  value: T, metadata: M,
) {
  return prop<ControllablePrimitiveWithOptionsModel<T, M>>(() => propertyMetadata.apply(
    () => new ControllablePrimitiveWithOptionsModel<T, M>({ value, $modelId: uuid() }), metadata,
  ));
}

export function radioProp<T>(
  value: T, metadata: Omit<RadioMetadata<T>, 'type'>,
) {
  return controllablePrimitiveWithOptionsProp<T, RadioMetadata<T>>(
    value, { type: INPUT_TYPE.RADIO, ...metadata },
  );
}

export function selectProp<T>(
  value: T, metadata: Omit<SelectMetadata<T>, 'type'>,
) {
  return controllablePrimitiveWithOptionsProp<T, SelectMetadata<T>>(
    value, { type: INPUT_TYPE.SELECT, ...metadata },
  );
}

// TODO: consider default label override + context for units on label
export const numberTextProp = (
  value: number, metadata?: Omit<NumberTextMetadata, 'type'>,
) => controllablePrimitiveProp<number, NumberTextMetadata>(
  value, { type: INPUT_TYPE.NUMBER_TEXT, ...metadata },
);

type InitialSelectionResolver<T> = (optionValues: T[], rootStore: object) => (T | undefined);

interface ReferenceSelectMetadata<T extends object> {
  type: INPUT_TYPE.REFERENCE_SELECT,
  options: MetadataOptions<T>,
  initialSelectionResolver?: InitialSelectionResolver<T>,
  typeRef: RefConstructor<T>,
  labelOverride?: labelOverride,
}

@model('ControllableReferenceModel')
export class ControllableReferenceModel<T extends object, M extends ReferenceMetadata> extends Model(
  <T extends object>() => ({ valueRef: prop<Ref<T> | undefined>() }),
)<T> {
  // since applying a snapshot will detach this node and construct a new one, transfer metadata to store
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAttachedToRootStore(rootStore) {
    // undefined when applying snapshot
    const metadataFromContext = propertyMetadata.get(this);
    if (metadataFromContext) {
      propertyMetadataRegistry.set(this.valuePath, propertyMetadata.get(this));
    }
  }

  @computed
  get metadata():M {
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
  get label():string {
    return resolveLabel(this);
  }

  @computed
  get valuePath() {
    return getRootPath(this).path.join('/');
  }
}

@model('ControllableReferenceWithOptionsModel')
export class ControllableReferenceWithOptionsModel<T extends object, M extends ReferenceSelectMetadata<T>> extends
  ExtendedModel(<T extends object, M extends ReferenceSelectMetadata<T>>() => ({
    baseModel: modelClass<ControllableReferenceModel<T, M>>(ControllableReferenceModel),
    props: {},
  }))<T, M> {
  readonly options: OptionsListItem<T>[] | undefined;

  onAttachedToRootStore(rootStore) {
    super.onAttachedToRootStore(rootStore);
    createOptionsGetter(this, rootStore);

    if (this.metadata.initialSelectionResolver !== undefined) {
      const value = this.metadata.initialSelectionResolver(this.options.map(({ value }) => value), rootStore);
      if (value) {
        this.valueRef = this.metadata.typeRef(value);
      }
    }
  }
}

export function referenceSelectProp<T extends object>(metadata: Omit<ReferenceSelectMetadata<T>, 'type'>) {
  return prop<ControllableReferenceWithOptionsModel<T, ReferenceSelectMetadata<T>>>(() => propertyMetadata.apply(
    () => new ControllableReferenceWithOptionsModel<T, ReferenceSelectMetadata<T>>({}), {
      type: INPUT_TYPE.REFERENCE_SELECT, ...metadata,
    },
  ));
}
