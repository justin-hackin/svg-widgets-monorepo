import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { GridPattern } from '../components/ResizableZoomPan/components/GridPattern';
import {
  BoundingBoxAttrs,
  boundingBoxAttrsToViewBoxStr,
  boundingBoxOfBoundingBoxes,
  viewBoxStrToBoundingBoxAttrs,
} from '../../common/util/svg';
import { SVGWrapper, WatermarkContentComponent } from '../../common/components/SVGWrapper';
import { Dimensions, filePathConstructor } from '../../common/util/data';
import type { RegisteredWidgetAssetMember } from './RegisteredAssetsDefinition';
import type {
  BaseAssetDefinition, DocumentAreaProps, ViewBoxProps,
} from './types';

export interface DisjunctWidgetAssetMember extends RegisteredWidgetAssetMember {
  documentAreaProps: DocumentAreaProps,
}

const castDocumentAreaPropsToBoundingBoxAttrs = (dap: DocumentAreaProps): BoundingBoxAttrs => {
  const { viewBox } = dap as ViewBoxProps;
  if (viewBox) {
    return viewBoxStrToBoundingBoxAttrs(viewBox);
  }
  const {
    width,
    height,
  } = dap as Dimensions;
  return {
    xmin: 0,
    ymin: 0,
    xmax: width,
    ymax: height,
    width,
    height,
  };
};

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
