import React, { SVGProps } from 'react';
import { observer } from 'mobx-react';
import type { Orientation } from '../../index';
import { DisjunctAssetsDefinition } from '../../widget-types/DisjunctAssetsDefinition';
import { RegisteredAssetsDefinition } from '../../widget-types/RegisteredAssetsDefinition';
import { assertNotNullish } from '../../../../helpers/assert';
import { WidgetDesignAreaToolbar } from './components/WidgetDesignAreaToolbar';
import { ResizableZoomPan } from '../ResizableZoomPan/index';
import { GridPattern } from '../ResizableZoomPan/components/GridPattern';
import { useWorkspaceMst } from '../../rootStore';
import { FullPageDiv } from '../../../../style';

export const WidgetDesignArea = observer(({
  showOrientationToggle,
  orientation,
}
: { showOrientationToggle: boolean, orientation: Orientation }) => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore } = workspaceStore;
  assertNotNullish(selectedStore);
  const definition = selectedStore.assetDefinition;
  const svgProps: SVGProps<any> = {};
  let innerContent;

  if (definition instanceof DisjunctAssetsDefinition) {
    if (definition.overlayModeEnabled) {
      Object.assign(svgProps, definition.allAssetsDocumentAreaProps);
    } else {
      Object.assign(svgProps, definition.selectedMember.documentAreaProps);
    }
    innerContent = (definition.overlayModeEnabled
      ? definition.members.map(({ Component }, index) => (<Component key={index} />))
      : (<definition.selectedMember.Component />));
  } else {
    Object.assign(svgProps, definition.documentAreaProps);
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

  return (
    <FullPageDiv>
      <WidgetDesignAreaToolbar orientation={orientation} showOrientationToggle={showOrientationToggle} />
      <ResizableZoomPan SVGBackground="url(#grid-pattern)">
        <svg {...svgProps}>
          <GridPattern patternId="grid-pattern" />
          {innerContent}
        </svg>
      </ResizableZoomPan>
    </FullPageDiv>
  );
});
