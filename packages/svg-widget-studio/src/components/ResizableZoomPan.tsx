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
  const { zoomPanView } = workspaceStore;
  const { width, height, ref } = useResizeDetector();
  return (
    <FullPageDiv ref={ref}>
      <ReactSVGPanZoom
        value={zoomPanView.value}
        background={theme.palette.mode === 'dark' ? theme.palette.grey['900'] : theme.palette.grey.A400}
        tool={zoomPanView.tool}
        toolbarProps={{ position: POSITION_LEFT }}
        customToolbar={() => null}
        customMiniature={() => null}
        onChangeValue={(val) => {
          zoomPanView.setValue(val);
        }}
        onChangeTool={(tool) => {
          zoomPanView.setTool(tool);
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
