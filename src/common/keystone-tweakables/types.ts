import { RefConstructor } from 'mobx-keystone';
import { TweakablePrimitiveModel } from './models/TweakablePrimitiveModel';
import { TweakableReferenceModel } from './models/TweakableReferenceModel';

export enum INPUT_TYPE {
  SLIDER = 'slider',
  SLIDER_WITH_TEXT = 'slider',
  SWITCH = 'switch',
  COLOR_PICKER = 'color-picker',
  RADIO = 'radio',
  REFERENCE_RADIO = 'radio',
  SELECT = 'select',
  REFERENCE_SELECT = 'reference-select',
  NUMBER_TEXT = 'number-text',
}

export type labelGenerator = (node: TweakableModel) => string;
export type labelOverride = string | labelGenerator;

interface BasePrimitiveMetadata {
  type: INPUT_TYPE,
  labelOverride?: labelOverride,
}

interface SliderRest {
  min: number,
  max: number,
  step: number,
}

export interface SliderMetadata extends SliderRest, BasePrimitiveMetadata {
  type: INPUT_TYPE.SLIDER,
}

export interface SwitchMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SWITCH,
}

export interface ColorPickerMetadata extends BasePrimitiveMetadata {
  type: INPUT_TYPE.COLOR_PICKER,
}

export interface OptionsListItem<T> {
  value: T,
  label?: string,
}

// TODO: is this the best parameter order?
export type OptionsListResolverFactory<T> = (rootStore: object, node: object) => (() => OptionsListItem<T>[]);
export type MetadataOptions<T> = OptionsListItem<T>[] | OptionsListResolverFactory<T>;

export interface RadioMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.RADIO,
  options: MetadataOptions<T>,
  isRow?: boolean,
}

export interface SelectMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SELECT,
  options: MetadataOptions<T>,
}

export type WithOptionsMetadata<T> = SelectMetadata<T> | RadioMetadata<T>;

export interface NumberTextRest {
  useUnits?: boolean,
}

export interface NumberTextMetadata extends BasePrimitiveMetadata, NumberTextRest {
  type: INPUT_TYPE.NUMBER_TEXT,
}

export interface SliderWithTextMetadata extends BasePrimitiveMetadata, NumberTextRest, SliderRest {
  type: INPUT_TYPE.SLIDER_WITH_TEXT
}

export type PrimitiveMetadata =
  SliderMetadata | SwitchMetadata | ColorPickerMetadata | RadioMetadata<any> | NumberTextMetadata | SelectMetadata<any>;
export type ReferenceMetadata = ReferenceWithOptionsMetadata<any>;
export type AnyMetadata = PrimitiveMetadata | ReferenceMetadata;
export type TweakableModel =
  TweakablePrimitiveModel<any, PrimitiveMetadata> | TweakableReferenceModel<any, ReferenceMetadata>;
type InitialSelectionResolver<T> = (optionValues: T[], rootStore: object) => (T | undefined);

export interface ReferenceResolvingOptionsMetadata<T extends object> extends BasePrimitiveMetadata {
  initialSelectionResolver?: InitialSelectionResolver<T>,
  typeRef: RefConstructor<T>,
  options: MetadataOptions<T>,
}

export interface ReferenceSelectMetadata<T extends object> extends ReferenceResolvingOptionsMetadata<T> {
  type: INPUT_TYPE.REFERENCE_SELECT,
}

export interface ReferenceRadioMetadata<T extends object> extends ReferenceResolvingOptionsMetadata<T> {
  type: INPUT_TYPE.REFERENCE_RADIO,
  isRow?: boolean
}

export type ReferenceWithOptionsMetadata<T extends object> = ReferenceRadioMetadata<T> | ReferenceSelectMetadata<T>;
