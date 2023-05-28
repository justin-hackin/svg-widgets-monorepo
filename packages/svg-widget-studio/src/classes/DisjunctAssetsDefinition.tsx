import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { GridPattern } from '../components/GridPattern';
import type { RegisteredWidgetAssetMember } from './RegisteredAssetsDefinition';
import {
  boundingBoxAttrsToViewBoxStr,
  boundingBoxOfBoundingBoxes,
  castDocumentAreaPropsToBoundingBoxAttrs,
} from '../helpers/bounds';
import { filePathConstructor } from '../helpers/string';
import {
  BaseAssetDefinition, DocumentAreaProps, ViewBoxProps, WatermarkContentComponent,
} from '../types';
import { SVGWrapper } from '../components/SVGWrapper';

export interface DisjunctWidgetAssetMember extends RegisteredWidgetAssetMember {
  documentAreaProps: DocumentAreaProps,
}

export class DisjunctAssetsDefinition implements BaseAssetDefinition {
  @observable
  public overlayModeEnabled = false;

  @observable
  public selectedMemberIndex = 0;

  @observable
  public members: DisjunctWidgetAssetMember[];

  constructor(
    members: DisjunctWidgetAssetMember[],
    public allowOverlayMode: boolean = true,
  ) {
    this.members = members;
    if (allowOverlayMode) { this.overlayModeEnabled = true; }
    makeObservable(this);
  }

  @action
  setSelectedMemberIndex(selectedIndex: number) {
    this.selectedMemberIndex = selectedIndex;
  }

  @action
  setOverlayModeEnabled(enabled: boolean) {
    this.overlayModeEnabled = enabled;
  }

  @computed
  get selectedMember() {
    return this.members[this.selectedMemberIndex];
  }

  @computed
  get WorkspaceView() {
    return (
      <svg {...(this.overlayModeEnabled ? this.allAssetsDocumentAreaProps : this.selectedMember.documentAreaProps)}>
        <GridPattern patternId="grid-pattern" />
        {
            this.overlayModeEnabled
              ? this.members.map(({ Component }, index) => (<Component key={index} />))
              : (<this.selectedMember.Component />)
          }
      </svg>
    );
  }

  @computed
  get allAssetsDocumentAreaProps(): DocumentAreaProps {
    const hasViewBoxMember = !!this.members.find((member) => !!(member.documentAreaProps as ViewBoxProps).viewBox);
    const bbs = this.members.map((member) => castDocumentAreaPropsToBoundingBoxAttrs(member.documentAreaProps));
    const consolidatedBB = boundingBoxOfBoundingBoxes(bbs);
    if (hasViewBoxMember) {
      return { viewBox: boundingBoxAttrsToViewBoxStr(consolidatedBB) };
    }
    const {
      width,
      height,
    } = consolidatedBB;
    return {
      width,
      height,
    };
  }

  getAssetsFileData(fileBaseName: string, WatermarkComponent?: WatermarkContentComponent) {
    return this.members.map(({
      Component,
      documentAreaProps,
      name,
      copies,
    }) => ({
      filePath: filePathConstructor(fileBaseName, name, copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper documentAreaProps={documentAreaProps}>
          { WatermarkComponent && (<WatermarkComponent documentAreaProps={documentAreaProps} />)}
          <Component />
        </SVGWrapper>,
      ),
    }));
  }
}
