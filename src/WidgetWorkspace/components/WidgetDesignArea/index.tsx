import { useWorkspaceMst } from '@/WidgetWorkspace/rootStore';
import {
  WidgetDesignAreaToolbar,
} from '@/WidgetWorkspace/components/WidgetDesignArea/components/WidgetDesignAreaToolbar';
import { ResizableZoomPan } from '@/WidgetWorkspace/components/ResizableZoomPan';
import React from 'react';
import type { Orientation } from '@/WidgetWorkspace';
import { assertNotNullish } from '@/common/util/assert';

export function WidgetDesignArea({
  showOrientationToggle,
  orientation,
}
: { showOrientationToggle: boolean, orientation: Orientation }) {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore } = workspaceStore;
  assertNotNullish(selectedStore);
  return (
    <>
      <WidgetDesignAreaToolbar orientation={orientation} showOrientationToggle={showOrientationToggle} />
      <ResizableZoomPan SVGBackground="url(#grid-pattern)">
        {selectedStore.assetDefinition.WorkspaceView}
      </ResizableZoomPan>
    </>
  );
}
