import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';

import { GridPattern } from '../components/GridPattern';
import type { RegisteredWidgetAssetMember } from './RegisteredAssetsDefinition';
import { boundingBoxOfBoundingBoxes, castDocumentAreaPropsToBoundingBoxAttrs } from '../helpers/bounds';
import { filePathConstructor } from '../helpers/string';
import { BaseAssetDefinition, DocumentArea, WatermarkContentComponent } from '../types';
import { SVGWrapper } from '../components/SVGWrapper';

export interface DisjunctWidgetAssetMember extends RegisteredWidgetAssetMember {
  documentArea: DocumentArea,
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
      <svg {...(this.overlayModeEnabled ? this.allAssetsDocumentAreaProps : this.selectedMember.documentArea)}>
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
  get allAssetsDocumentAreaProps(): DocumentArea {
    const bbs = this.members.map((member) => castDocumentAreaPropsToBoundingBoxAttrs(member.documentArea));
    return boundingBoxOfBoundingBoxes(bbs);
  }

  getAssetsFileData(fileBaseName: string, WatermarkComponent?: WatermarkContentComponent) {
    return this.members.map(({
      Component,
      documentArea,
      name,
      copies,
    }) => ({
      filePath: filePathConstructor(fileBaseName, name, copies),
      fileString: ReactDOMServer.renderToString(
        <SVGWrapper documentArea={documentArea}>
          { WatermarkComponent && (<WatermarkComponent documentArea={documentArea} />)}
          <Component />
        </SVGWrapper>,
      ),
    }));
  }
}
