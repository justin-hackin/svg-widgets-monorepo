import { FC, MutableRefObject } from 'react';
import { _Model } from 'mobx-keystone';
import { dimensions } from '../common/util/data';

interface viewBoxProps { viewBox: string }

export interface AdditionalFileMenuItemsProps {
  resetFileMenuRef: MutableRefObject<undefined>,
}

export interface WidgetModel {
  savedModel: object,
  getFileBasename: () => string,
  WidgetSVG: () => JSX.Element,
  documentAreaProps: (dimensions | viewBoxProps),
  AdditionalToolbarContent?: () => JSX.Element,
  AdditionalFileMenuItems?: FC<AdditionalFileMenuItemsProps>,
  AdditionalMainContent?: FC,
  PanelContent: FC,
  specFileExtension: string,
  specFileExtensionName?: string,
}

export interface WidgetOptions {
  // TODO: enforce common params
  WidgetModel: _Model<any, any>,
}

export type WidgetOptionsCollection = Record<string, WidgetOptions>;
