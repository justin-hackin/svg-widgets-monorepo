import {
  action, computed, makeObservable, observable,
} from 'mobx';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { observer } from 'mobx-react';
import { GridPattern } from '../components/ResizableZoomPan/components/GridPattern';
import {
  BoundingBoxAttrs,
  boundingBoxAttrsToViewBoxStr,
  boundingBoxOfBoundingBoxes,
  viewBoxStrToBoundingBoxAttrs,
} from '../../common/util/svg';
import { SVGWrapper } from '../../common/components/SVGWrapper';
import { dimensions } from '../../common/util/data';
import { RegisteredWidgetAssetMember } from './RegisteredAssetsDefinition';
import {
  BaseAssetDefinition, DocumentAreaProps, filePathConstructor, viewBoxProps,
} from './types';

export interface DisjunctWidgetAssetMember extends RegisteredWidgetAssetMember {
  documentAreaProps: DocumentAreaProps,
}

const castDocumentAreaPropsToBoundingBoxAttrs = (dap: DocumentAreaProps): BoundingBoxAttrs => {
  const { viewBox } = dap as viewBoxProps;
  if (viewBox) {
    return viewBoxStrToBoundingBoxAttrs(viewBox);
  }
  const {
    width,
    height,
  } = dap as dimensions;
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
  public overlayModeEnabled = false;

  public selectedMember = 0;

  constructor(
    public members: DisjunctWidgetAssetMember[],
    public allowOverlayMode: boolean = true,
  ) {
    if (allowOverlayMode) { this.overlayModeEnabled = true; }
    makeObservable(this, {
      selectedMember: observable,
      setSelectedMember: action,
      overlayModeEnabled: observable,
      setOverlayModeEnabled: action,
    });
  }

  setSelectedMember(selectedIndex: number) {
    this.selectedMember = selectedIndex;
  }

  setOverlayModeEnabled(enabled: boolean) {
    this.overlayModeEnabled = enabled;
  }

  @computed
  get WorkspaceView() {
    const {
      Component,
      documentAreaProps,
    } = this.members[this.selectedMember];
    const SelectedObserverComponent = observer(Component);
    return (
      <svg {...(this.overlayModeEnabled ? this.allAssetsDocumentAreaProps : documentAreaProps)}>
        <GridPattern patternId="grid-pattern" />
        {
          this.overlayModeEnabled
            ? this.members.map(({ Component }, index) => {
              const ThisObserverComponent = observer(Component);
              return (<ThisObserverComponent key={index} />);
            })
            : (<SelectedObserverComponent />)
        }
      </svg>
    );
  }

  @computed
  get allAssetsDocumentAreaProps() {
    const hasViewBoxMember = !!this.members.find((member) => !!(member.documentAreaProps as viewBoxProps).viewBox);
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
