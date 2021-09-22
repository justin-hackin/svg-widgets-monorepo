import { FC, MutableRefObject } from 'react';
import { _Model } from 'mobx-keystone';
import { PreferencesModel } from './models/PreferencesModel';
import { PyramidNetWidgetModel } from '../widgets/PyramidNet/models/PyramidNetMakerStore';

export interface WidgetModel {
  savedModel: object,
  getFileBasename: (...any) => string,
}

export interface RawSvgComponentProps {
  preferencesStore?: PreferencesModel,
  widgetStore: PyramidNetWidgetModel,
}

export interface AdditionalFileMenuItemsProps {
  resetFileMenuRef: MutableRefObject<undefined>,
}

export interface WidgetOptions {
  RawSvgComponent: FC<any>,
  controlPanelProps: {
    AdditionalToolbarContent?: FC,
    AdditionalFileMenuItems?: FC<AdditionalFileMenuItemsProps>,
    PanelContent: FC,
  },
  // TODO: enforce common params
  WidgetModel: _Model<any, any>,
  AdditionalMainContent?: FC,
  specFileExtension: string,
  specFileExtensionName?: string,
}

export type WidgetOptionsCollection = Record<string, WidgetOptions>;
