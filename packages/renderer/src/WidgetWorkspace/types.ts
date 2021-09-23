import { FC, MutableRefObject } from 'react';
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
  PanelContent?: FC,
  specFileExtension: string,
  specFileExtensionName?: string,
  [prop: string]: any,
}
