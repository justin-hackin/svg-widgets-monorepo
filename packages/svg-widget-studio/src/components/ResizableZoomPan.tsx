import React from 'react';
import { POSITION_LEFT, ReactSVGPanZoom } from 'react-svg-pan-zoom';
import { observer } from 'mobx-react';
import { useTheme } from '@mui/styles';
import { useResizeDetector } from 'react-resize-detector';
import { useWorkspaceMst } from '../rootStore';
import { FullPageDiv } from '../style';

export const ResizableZoomPan = observer(({ children, ...props }) => {
  const theme = useTheme();
  const workspaceStore = useWorkspaceMst();
  const { width, height, ref } = useResizeDetector();
  const value = workspaceStore.zoomPanValue;
  const tool = workspaceStore.zoomPanTool;
  return (
    <FullPageDiv ref={ref}>
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
        width={width ?? 0}
        height={height ?? 0}
        {...props}
      >
        {children}
      </ReactSVGPanZoom>
    </FullPageDiv>
  );
});
