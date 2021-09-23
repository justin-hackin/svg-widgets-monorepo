import { FC, MutableRefObject } from 'react';
import { _Model } from 'mobx-keystone';
import { dimensions } from '../common/util/data';

interface viewBoxProps { viewBox: string }

export interface WidgetModel {
  savedModel: object,
  getFileBasename: () => string,
  WidgetSVG: () => JSX.Element,
  AdditionalToolbarContent?: () => JSX.Element,
  documentAreaProps: dimensions | viewBoxProps
}

export interface AdditionalFileMenuItemsProps {
  resetFileMenuRef: MutableRefObject<undefined>,
}

export interface WidgetOptions {
  controlPanelProps: {
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
