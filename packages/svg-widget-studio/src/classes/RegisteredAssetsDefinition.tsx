// "registered" refers to the assets being ontop of one another, like Print and Dieline assets
import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { GridPattern } from '../components/GridPattern';
import {
  BaseAssetDefinition,
  DocumentAreaProps,
  TxtFileInfo,
  WatermarkContentComponent,
  WidgetSVGComponent,
} from '../types';
import { SVGWrapper } from '../components/SVGWrapper';
import { filePathConstructor } from '../helpers/string';

export interface RegisteredWidgetAssetMember {
  name: string,
  copies?: number,
  Component: WidgetSVGComponent,
}

export class RegisteredAssetsDefinition implements BaseAssetDefinition {
  @observable
  public memberVisibility: boolean[];

  constructor(
    public documentAreaProps: DocumentAreaProps,
    public members: RegisteredWidgetAssetMember[],
  ) {
    makeObservable(this);
    this.memberVisibility = Array(members.length)
      .fill(true);
  }

  @action
  setMemberVisibility(index: number, isVisible: boolean) {
    if (this.memberVisibility[index] === undefined) {
      throw new Error('out of range index while setting member visibility');
    }
    this.memberVisibility[index] = isVisible;
  }

  @computed
  get WorkspaceView() {
    return (
      <svg {...this.documentAreaProps}>
        <GridPattern patternId="grid-pattern" />
        {this.members.map(({ Component }, index) => (
          <g key={index} visibility={this.memberVisibility[index] ? 'visible' : 'hidden'}>
            <Component />
          </g>
        ))}
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string, WatermarkComponent?: WatermarkContentComponent) {
    return this.members.reduce((acc, {
      Component,
      name,
      copies,
    }) => {
      // TODO: any way to reduce redundancy of rendering Component twice?
      //  XML syntax escaped when stringified so can't use it inside SVGWrapper
      // don't save components that don't render anything
      const componentStr = ReactDOMServer.renderToString(<Component />);
      if (componentStr) {
        acc.push({
          filePath: filePathConstructor(fileBaseName, name, copies),
          fileString: ReactDOMServer.renderToString(
            <SVGWrapper documentAreaProps={this.documentAreaProps}>
              { WatermarkComponent && (<WatermarkComponent documentAreaProps={this.documentAreaProps} />)}
              <Component />
            </SVGWrapper>,
          ),
        });
      }
      return acc;
    }, [] as TxtFileInfo[]);
  }
}
