import { computed, makeObservable } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { GridPattern } from '../components/GridPattern';
import { SVGWrapper } from '../components/SVGWrapper';
import {
  BaseAssetDefinition, DocumentArea, WatermarkContentComponent, WidgetSVGComponent,
} from '../types';
import { filePathConstructor } from '../helpers/string';

export class SolitaryAssetDefinition implements BaseAssetDefinition {
  constructor(
    public documentArea: DocumentArea,
    public Component: WidgetSVGComponent,
    public copies?: number | undefined,
  ) {
    makeObservable(this);
  }

  @computed
  get WorkspaceView() {
    const {
      Component,
      documentArea,
    } = this;
    return (
      <svg {...documentArea}>
        <GridPattern patternId="grid-pattern" />
        <Component />
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string, WatermarkComponent?: WatermarkContentComponent) {
    const {
      Component,
      documentArea,
    } = this;
    return [{
      filePath: filePathConstructor(fileBaseName, undefined, this.copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper documentArea={documentArea}>
          { WatermarkComponent && (<WatermarkComponent documentArea={documentArea} />)}
          <Component />
        </SVGWrapper>,
      ),
    }];
  }
}
