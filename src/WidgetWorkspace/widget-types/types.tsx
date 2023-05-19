import { FC, ReactElement } from 'react';

import { TxtFileInfo } from '@/common/types';
import { WatermarkContentComponent } from '@/common/components/SVGWrapper';
import { dimensions } from '../../common/util/data';

export interface viewBoxProps { viewBox: string }

export type WidgetSVGComponent = FC<any>;
export type DocumentAreaProps = (dimensions | viewBoxProps);
export const documentAreaPropsAreViewBoxProps = (
  dap: DocumentAreaProps,
): dap is viewBoxProps => !!(dap as viewBoxProps).viewBox;
export const castToViewBox = (dap: DocumentAreaProps) => (documentAreaPropsAreViewBoxProps(dap)
  ? dap.viewBox : `0 0 ${dap.width} ${dap.height}`);

export interface BaseAssetDefinition {
  WorkspaceView: ReactElement<any, any>;
  getAssetsFileData(fileBaseName: string, WatermarkContent: WatermarkContentComponent): TxtFileInfo[];
}

export const filePathConstructor = (
  fileBaseName: string,
  assetName: string | undefined,
  copies: number | undefined,
) => `${fileBaseName}${assetName ? `__${assetName}` : ''}${copies ? `__X${copies}` : ''}.svg`;
