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
import { documentAreaToSVGProps } from '../helpers/bounds';
import { DocumentArea } from '../types';

export const WidgetDesignArea = observer(({
  showOrientationToggle,
  orientation,
}
: { showOrientationToggle: boolean, orientation: Orientation }) => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore } = workspaceStore;
  assertNotNullish(selectedStore);
  const definition = selectedStore.assetDefinition;
  let documentArea: DocumentArea;
  let innerContent;

  if (definition instanceof DisjunctAssetsDefinition) {
    if (definition.overlayModeEnabled) {
      documentArea = definition.allAssetsDocumentAreaProps;
    } else {
      documentArea = definition.selectedMember.documentArea;
    }
    innerContent = (definition.overlayModeEnabled
      ? definition.members.map(({ Component }, index) => (<Component key={index} />))
      : (<definition.selectedMember.Component />));
  } else {
    documentArea = definition.documentArea;
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

  const documentAreaProps = documentAreaToSVGProps(documentArea);

  return (
    <FullPageDiv>
      <WidgetDesignAreaToolbar orientation={orientation} showOrientationToggle={showOrientationToggle} />
      <ResizableZoomPan SVGBackground="url(#grid-pattern)">
        <svg {...(documentAreaProps)}>
          <GridPattern patternId="grid-pattern" />
          {innerContent}
        </svg>
      </ResizableZoomPan>
    </FullPageDiv>
  );
});
