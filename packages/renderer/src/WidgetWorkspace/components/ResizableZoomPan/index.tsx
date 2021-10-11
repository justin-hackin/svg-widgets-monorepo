import React from 'react';
import { POSITION_LEFT, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { observer } from 'mobx-react';
import { ResizeDetector } from './components/ResizeDetector';
import { useWorkspaceMst } from '../../models/WorkspaceModel';

const BACKGROUND_COLOR = '#454545';

export const ResizableZoomPan = observer(({ children, ...props }) => {
  const workspaceStore = useWorkspaceMst();
  const value = workspaceStore.zoomPanValue;
  const tool = workspaceStore.zoomPanTool;
  return (
    <ResizeDetector>
      {(dimensions) => (
        <ReactSVGPanZoom
          value={value}
          background={BACKGROUND_COLOR}
          tool={tool}
          toolbarProps={{ position: POSITION_LEFT }}
          customMiniature={() => null}
          onChangeValue={(val) => {
            workspaceStore.setZoomPanValue(val);
          }}
          onChangeTool={(tool) => {
            workspaceStore.setZoomPanTool(tool);
          }}
          {...props}
          {...dimensions}
        >
          {children}
        </ReactSVGPanZoom>
      )}
    </ResizeDetector>
  );
});
