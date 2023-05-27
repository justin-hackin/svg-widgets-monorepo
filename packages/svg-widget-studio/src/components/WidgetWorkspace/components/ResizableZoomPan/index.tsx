import React from 'react';
import { POSITION_LEFT, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { observer } from 'mobx-react';
import { useTheme } from '@mui/styles';
import { ResizeDetector } from '../ResizeDetector';
import { useWorkspaceMst } from '../../rootStore';

export const ResizableZoomPan = observer(({ children, ...props }) => {
  const theme = useTheme();
  const workspaceStore = useWorkspaceMst();
  const value = workspaceStore.zoomPanValue;
  const tool = workspaceStore.zoomPanTool;
  return (
    <ResizeDetector>
      {(dimensions) => (
        <ReactSVGPanZoom
          value={value}
          background={theme.palette.mode === 'dark' ? theme.palette.grey['900'] : theme.palette.grey.A400}
          tool={tool}
          toolbarProps={{ position: POSITION_LEFT }}
          customToolbar={() => null}
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
