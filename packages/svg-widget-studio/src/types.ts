import { FC, ReactElement } from 'react';
import { SvgIcon } from '@mui/material';
import { RefConstructor } from 'mobx-keystone';

import type { DisjunctAssetsDefinition } from './classes/DisjunctAssetsDefinition';
import type { RegisteredAssetsDefinition } from './classes/RegisteredAssetsDefinition';
import type { SolitaryAssetDefinition } from './classes/SolitaryAssetDefinition';
import type { TweakablePrimitiveModel } from './models/TweakablePrimitiveModel';
import type { TweakableReferenceModel } from './models/TweakableReferenceModel';
import type { TweakablePrimitiveWithOptionsModel } from './models/TweakablePrimitiveWithOptionsModel';
// TODO: better way to export type of class only?
// eslint-disable-next-line import/no-cycle
import { WorkspaceModel as WorkspaceModelClass } from './models/WorkspaceModel';

export interface ViewBoxProps {
  viewBox: string
}

export type WidgetSVGComponent = FC<any>;
export type DocumentAreaProps = (Dimensions | ViewBoxProps);
export const documentAreaPropsAreViewBoxProps = (
  dap: DocumentAreaProps,
): dap is ViewBoxProps => !!(dap as ViewBoxProps).viewBox;

export interface BaseAssetDefinition {
  WorkspaceView: ReactElement<any, any>;

  getAssetsFileData(fileBaseName: string, WatermarkContent?: WatermarkContentComponent): TxtFileInfo[];
}

export type AnyAssetDefinition = DisjunctAssetsDefinition | RegisteredAssetsDefinition | SolitaryAssetDefinition;
export type WatermarkContentComponent = FC<{ documentAreaProps: DocumentAreaProps }>;
export type DocumentAreaPropertyNames = 'width' | 'height' | 'viewBox';

export interface TxtFileInfo {
  fileString: string,
  filePath: string,
}

export interface FileMenuItem {
  action: Function,
  MenuIcon: typeof SvgIcon,
  menuText: string,
}

export interface Dimensions {
  width: number,
  height: number
}

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

export interface BasePrimitiveMetadata {
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

export type OptionsListResolverFactory<T> = (node: object) => (T[]);
export type MetadataOptions<T> = T[] | OptionsListResolverFactory<T>;
type OptionLabelMapFn<T> = (t: T, index?: number) => string;

export interface RadioMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.RADIO,
  options: MetadataOptions<T>,
  optionLabelMap?: OptionLabelMapFn<T>,
  isRow?: boolean,
  valueParser?: (value: string) => T,
}

export interface SelectMetadata<T> extends BasePrimitiveMetadata {
  type: INPUT_TYPE.SELECT,
  options: MetadataOptions<T>,
  optionLabelMap?: OptionLabelMapFn<T>,
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

export interface ReferenceResolvingOptionsMetadata<T extends object> extends BasePrimitiveMetadata {
  typeRef: RefConstructor<T>,
  options: MetadataOptions<T>,
  optionLabelMap?: OptionLabelMapFn<T>,
}

export interface ReferenceSelectMetadata<T extends object> extends ReferenceResolvingOptionsMetadata<T> {
  type: INPUT_TYPE.REFERENCE_SELECT,
}

export interface ReferenceRadioMetadata<T extends object> extends ReferenceResolvingOptionsMetadata<T> {
  type: INPUT_TYPE.REFERENCE_RADIO,
  isRow?: boolean
}

export type ReferenceWithOptionsMetadata<T extends object> = ReferenceRadioMetadata<T> | ReferenceSelectMetadata<T>;

export type WorkspaceModel = typeof WorkspaceModelClass;
