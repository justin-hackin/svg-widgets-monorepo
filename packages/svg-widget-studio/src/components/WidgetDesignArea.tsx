import React from 'react';
import { observer } from 'mobx-react';
import type { Orientation } from './WidgetWorkspace';
import { DisjunctAssetsDefinition } from '../classes/DisjunctAssetsDefinition';
import { RegisteredAssetsDefinition } from '../classes/RegisteredAssetsDefinition';
import { assertNotNullish } from '../helpers/assert';
import { WidgetDesignAreaToolbar } from './WidgetDesignAreaToolbar';
import { ResizableZoomPan } from './ResizableZoomPan';
import { GridPattern } from './GridPattern';
import { useWorkspaceMst } from '../rootStore';
import { FullPageDiv } from '../style';
import { DocumentArea, documentAreaPropsAreBoundingBoxAttrs } from '../types';
import { boundingBoxAttrsToViewBoxStr } from '../helpers/bounds';

export const WidgetDesignArea = observer(({
  showOrientationToggle,
  orientation,
}
: { showOrientationToggle: boolean, orientation: Orientation }) => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore } = workspaceStore;
  assertNotNullish(selectedStore);
  const definition = selectedStore.assetDefinition;
  let documentAreaProps: DocumentArea;
  let innerContent;

  if (definition instanceof DisjunctAssetsDefinition) {
    if (definition.overlayModeEnabled) {
      documentAreaProps = definition.allAssetsDocumentAreaProps;
    } else {
      documentAreaProps = definition.selectedMember.documentAreaProps;
    }
    innerContent = (definition.overlayModeEnabled
      ? definition.members.map(({ Component }, index) => (<Component key={index} />))
      : (<definition.selectedMember.Component />));
  } else {
    documentAreaProps = definition.documentAreaProps;
    if (definition instanceof RegisteredAssetsDefinition) {
      innerContent = definition.members.map(({ Component }, index) => (
        <g key={index} visibility={definition.memberVisibility[index] ? 'visible' : 'hidden'}>
          <Component />
        </g>
      ));
    } else {
      //   Solitary
      innerContent = (<definition.Component />);
    }
  }
  const documentAreaAttrs = documentAreaPropsAreBoundingBoxAttrs(documentAreaProps)
    ? {
      viewBox: boundingBoxAttrsToViewBoxStr(documentAreaProps),
      width: documentAreaProps.width,
      height: documentAreaProps.height,
    }
    : documentAreaProps;
  return (
    <FullPageDiv>
      <WidgetDesignAreaToolbar orientation={orientation} showOrientationToggle={showOrientationToggle} />
      <ResizableZoomPan SVGBackground="url(#grid-pattern)">
        <svg {...(documentAreaAttrs)}>
          <GridPattern patternId="grid-pattern" />
          {innerContent}
        </svg>
      </ResizableZoomPan>
    </FullPageDiv>
  );
});
