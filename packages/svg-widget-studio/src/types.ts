import { FC, ReactElement } from 'react';
import { SvgIcon } from '@mui/material';
import type { DisjunctAssetsDefinition } from './components/WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import type { RegisteredAssetsDefinition } from './components/WidgetWorkspace/widget-types/RegisteredAssetsDefinition';
import type { SolitaryAssetDefinition } from './components/WidgetWorkspace/widget-types/SolitaryAssetDefinition';

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

export interface BoundingBoxAttrs {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
  width: number
  height: number
}

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
