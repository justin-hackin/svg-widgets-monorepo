import React, { FC, ReactElement } from 'react';
import { Model, ModelProp } from 'mobx-keystone';
import { computed, makeObservable } from 'mobx';
import ReactDOMServer from 'react-dom/server';
import { dimensions } from '../common/util/data';
import { GridPattern } from './components/ResizableZoomPan/components/GridPattern';
import { SVGWrapper } from './components/SVGWrapper';
import { TxtFileInfo } from '../../../common/types';

interface viewBoxProps { viewBox: string }

export interface AdditionalFileMenuItemsProps {
  resetFileMenuRef: ()=>void,
}

type WidgetSVGComponent = FC<any>;
// "registered" refers to the assets being ontop of one another, like Print and Dieline assets
interface RegisteredWidgetAssetMember {
  name: string,
  copies?: number,
  Component: WidgetSVGComponent,
}

interface DisjunctWidgetAssetMember extends RegisteredWidgetAssetMember {
  documentAreaProps: (dimensions | viewBoxProps),
}
type DocumentAreaProps = (dimensions | viewBoxProps);

export abstract class BaseWidgetClass extends Model({}) {
  abstract savedModel: ModelProp<any, any, false, false, true>;

  abstract getFileBasename(): string;

  abstract AdditionalToolbarContent?: () => JSX.Element;

  abstract AdditionalFileMenuItems?: FC<AdditionalFileMenuItemsProps>;

  abstract AdditionalMainContent?: FC;

  abstract PanelContent?: FC;

  abstract specFileExtension: string;

  abstract specFileExtensionName?: string;

  abstract get assetDefinition(): AssetDefinition;
}

interface BaseAssetDefinition {
  WorkspaceView: ReactElement<any, any>;
  getAssetsFileData(fileBaseName: string): TxtFileInfo[];
}

const filePathConstructor = (
  fileBaseName: string, assetName: string | undefined, copies: number | undefined,
) => `${fileBaseName}${assetName ? `__${assetName}` : ''}${copies ? `__X${copies}` : ''}.svg`;

export class RegisteredAssetsDefinition implements BaseAssetDefinition {
  public memberVisibility: boolean[];

  constructor(
    public documentAreaProps: DocumentAreaProps,
    public members: RegisteredWidgetAssetMember[],
  ) {
    makeObservable(this);
    this.memberVisibility = Array(members.length).fill(true);
  }

  setMemberVisibility(index: number, isVisible: boolean) {
    this.memberVisibility[index] = isVisible;
  }

  @computed
  get WorkspaceView() {
    const { documentAreaProps, memberVisibility, members } = this;
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

class DisjunctAssetsDefinition implements BaseAssetDefinition {
  constructor(
    public members: DisjunctWidgetAssetMember[],
    public selectedMember: number,
  ) {
    makeObservable(this);
  }

  @computed
  get WorkspaceView() {
    const { Component, documentAreaProps } = this.members[this.selectedMember];
    return (
      <svg {...documentAreaProps}>
        <GridPattern patternId="grid-pattern" />
        <Component />
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string) {
    return this.members.map(({
      Component,
      documentAreaProps,
      name,
      copies,
    }) => ({
      filePath: filePathConstructor(fileBaseName, name, copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper {...documentAreaProps}>
          <Component />
        </SVGWrapper>,
      ),
    }));
  }
}

class SolitaryAssetDefinition implements BaseAssetDefinition {
  constructor(
    public documentAreaProps: DocumentAreaProps,
    public Component: WidgetSVGComponent,
    public copies?: number | undefined,
  ) {
    makeObservable(this);
  }

  @computed
  get WorkspaceView() {
    const { Component, documentAreaProps } = this;
    return (
      <svg {...documentAreaProps}>
        <GridPattern patternId="grid-pattern" />
        <Component />
      </svg>
    );
  }

  getAssetsFileData(fileBaseName: string) {
    const { Component, documentAreaProps } = this;
    return [{
      filePath: filePathConstructor(fileBaseName, undefined, this.copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper {...documentAreaProps}>
          <Component />
        </SVGWrapper>,
      ),
    }];
  }
}

export type AssetDefinition = DisjunctAssetsDefinition | RegisteredAssetsDefinition | SolitaryAssetDefinition;
