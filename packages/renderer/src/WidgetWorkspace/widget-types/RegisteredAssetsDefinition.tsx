// "registered" refers to the assets being ontop of one another, like Print and Dieline assets
import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { GridPattern } from '../components/ResizableZoomPan/components/GridPattern';
import { SVGWrapper } from '../components/SVGWrapper';
import {
  BaseAssetDefinition, DocumentAreaProps, filePathConstructor, WidgetSVGComponent,
} from './types';

export interface RegisteredWidgetAssetMember {
  name: string,
  copies?: number,
  Component: WidgetSVGComponent,
}

export class RegisteredAssetsDefinition implements BaseAssetDefinition {
  public memberVisibility: boolean[];

  constructor(
    public documentAreaProps: DocumentAreaProps,
    public members: RegisteredWidgetAssetMember[],
  ) {
    makeObservable(this, {
      memberVisibility: observable,
      setMemberVisibility: action,
    });
    this.memberVisibility = Array(members.length)
      .fill(true);
  }

  setMemberVisibility(index: number, isVisible: boolean) {
    if (this.memberVisibility[index] === undefined) {
      throw new Error('out of range index while setting member visibility');
    }
    this.memberVisibility[index] = isVisible;
  }

  @computed
  get WorkspaceView() {
    const {
      documentAreaProps,
      memberVisibility,
      members,
    } = this;
    return (
      <svg {...documentAreaProps}>
        <GridPattern patternId="grid-pattern" />
        {members.map(({ Component }, index) => (
          <g key={index} visibility={memberVisibility[index] ? 'visible' : 'hidden'}>
            <Component />
          </g>
        ))}
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string) {
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
            <SVGWrapper {...this.documentAreaProps}>
              <Component />
            </SVGWrapper>,
          ),
        });
      }
      return acc;
    }, []);
  }
}
