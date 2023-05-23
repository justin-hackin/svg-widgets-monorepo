import { FC, ReactElement } from 'react';

import { TxtFileInfo } from '@/common/types';
import { WatermarkContentComponent } from '@/common/components/SVGWrapper';
import { DisjunctAssetsDefinition } from '@/WidgetWorkspace/widget-types/DisjunctAssetsDefinition';
import { RegisteredAssetsDefinition } from '@/WidgetWorkspace/widget-types/RegisteredAssetsDefinition';
import { SolitaryAssetDefinition } from '@/WidgetWorkspace/widget-types/SolitaryAssetDefinition';
import { Dimensions } from '../../common/util/data';

export interface ViewBoxProps { viewBox: string }
export type WidgetSVGComponent = FC<any>;
export type DocumentAreaProps = (Dimensions | ViewBoxProps);
export const documentAreaPropsAreViewBoxProps = (
  dap: DocumentAreaProps,
): dap is ViewBoxProps => !!(dap as ViewBoxProps).viewBox;
export const castToViewBox = (dap: DocumentAreaProps) => (documentAreaPropsAreViewBoxProps(dap)
  ? dap.viewBox : `0 0 ${dap.width} ${dap.height}`);

export interface BaseAssetDefinition {
  WorkspaceView: ReactElement<any, any>;
  getAssetsFileData(fileBaseName: string, WatermarkContent?: WatermarkContentComponent): TxtFileInfo[];
}

export type AnyAssetDefinition = DisjunctAssetsDefinition | RegisteredAssetsDefinition | SolitaryAssetDefinition;
