import { FC, ReactElement } from 'react';

import { TxtFileInfo } from '@/common/types';
import { dimensions } from '../../common/util/data';

export interface viewBoxProps { viewBox: string }

export type WidgetSVGComponent = FC<any>;
export type DocumentAreaProps = (dimensions | viewBoxProps);

export interface BaseAssetDefinition {
  WorkspaceView: ReactElement<any, any>;
  getAssetsFileData(fileBaseName: string): TxtFileInfo[];
}

export const filePathConstructor = (
  fileBaseName: string,
  assetName: string | undefined,
  copies: number | undefined,
) => `${fileBaseName}${assetName ? `__${assetName}` : ''}${copies ? `__X${copies}` : ''}.svg`;
