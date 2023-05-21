import { computed, makeObservable } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { GridPattern } from '../components/ResizableZoomPan/components/GridPattern';
import { SVGWrapper } from '../../common/components/SVGWrapper';
import {
  BaseAssetDefinition, DocumentAreaProps, filePathConstructor, WidgetSVGComponent,
} from './types';

export class SolitaryAssetDefinition implements BaseAssetDefinition {
  constructor(
    public documentAreaProps: DocumentAreaProps,
    public Component: WidgetSVGComponent,
    public copies?: number | undefined,
  ) {
    makeObservable(this);
  }

  @computed
  get WorkspaceView() {
    const {
      Component,
      documentAreaProps,
    } = this;
    return (
      <svg {...documentAreaProps}>
        <GridPattern patternId="grid-pattern" />
        <Component />
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string) {
    const {
      Component,
      documentAreaProps,
    } = this;
    return [{
      filePath: filePathConstructor(fileBaseName, undefined, this.copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper documentAreaProps={documentAreaProps}>
          <Component />
        </SVGWrapper>,
      ),
    }];
  }
}
