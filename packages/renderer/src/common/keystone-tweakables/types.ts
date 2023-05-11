import { RefConstructor } from 'mobx-keystone';
import { TweakablePrimitiveModel } from './models/TweakablePrimitiveModel';
import { TweakableReferenceModel } from './models/TweakableReferenceModel';
import { TweakablePrimitiveWithOptionsModel } from './models/TweakablePrimitiveWithOptionsModel';

export enum INPUT_TYPE {
  SWITCH = 'switch',
  SLIDER = 'slider',
  SLIDER_WITH_TEXT = 'slider-with-text',
  NUMBER_TEXT = 'number-text',
  SELECT = 'select',
  RADIO = 'radio',
  COLOR_PICKER = 'color-picker',
  REFERENCE_SELECT = 'reference-select',
  REFERENCE_RADIO = 'reference-radio',
}

export type labelGenerator = (node: TweakableModel) => string;
export type labelOverride = string | labelGenerator;

interface BasePrimitiveMetadata {
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

export type OptionsListResolverFactory<T> = (rootStore: object, node: object) => (() => OptionsListItem<T>[]);
export type MetadataOptions<T> = OptionsListItem<T>[] | OptionsListResolverFactory<T>;

export interface RadioMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.RADIO,
  options: MetadataOptions<T>,
  isRow?: boolean,
  valueParser?: (value: string)=>T,
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
  | SwitchMetadata
  | SliderMetadata
  | SliderWithTextMetadata
  | NumberTextMetadata
  | ColorPickerMetadata
  | RadioMetadata<any>
  | SelectMetadata<any>;

export type ReferenceMetadata = ReferenceWithOptionsMetadata<any>;
export type AnyMetadata = PrimitiveMetadata | ReferenceMetadata;
export type TweakableModel =
  TweakablePrimitiveModel<any, PrimitiveMetadata>
  | TweakableReferenceModel<any, ReferenceMetadata>
  | TweakablePrimitiveWithOptionsModel<any, WithOptionsMetadata<any>>;
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
