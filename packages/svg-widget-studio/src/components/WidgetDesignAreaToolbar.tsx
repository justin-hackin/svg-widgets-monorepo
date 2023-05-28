import React from 'react';
import {
  Divider, IconButton, Paper, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  Tool, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT,
} from 'react-svg-pan-zoom';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import PanToolIcon from '@mui/icons-material/PanTool';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { styled } from '@mui/styles';
import { observer } from 'mobx-react';
import { HorizontalSplit, VerticalSplit } from '@mui/icons-material';
import type { WorkspaceModel } from '../models/WorkspaceModel';
import { useWorkspaceMst } from '../rootStore';
import type { Orientation } from './WidgetWorkspace';

const TOOL_ICON_MAP = {
  [TOOL_PAN]: PanToolIcon,
  [TOOL_ZOOM_IN]: ZoomInIcon,
  [TOOL_ZOOM_OUT]: ZoomOutIcon,
};

const PaperStyled = styled(Paper)(({ theme }) => ({
  flexDirection: 'row',
  position: 'absolute',
  display: 'flex',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  padding: theme.spacing(0.5),
  zIndex: 1,
  '&.orientation-horizontal': {
    flexDirection: 'column',
    top: theme.spacing(1),
    bottom: 'initial',
  },
}));

export const WidgetDesignAreaToolbar = observer((
  { orientation, showOrientationToggle }:
  { orientation: Orientation, showOrientationToggle: boolean },
) => {
  const workspaceStore: WorkspaceModel = useWorkspaceMst();
  const { zoomPanTool, preferences } = workspaceStore;
  const oppositeOrientation: Orientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
  return (
    <PaperStyled elevation={3} className={`orientation-${oppositeOrientation}`}>
      <ToggleButtonGroup
        orientation={orientation}
        exclusive
        value={zoomPanTool}
        aria-label="zoom pan mode"
        onChange={(_, tool) => {
          workspaceStore.setZoomPanTool(tool as Tool);
        }}
      >
        {Object.entries(TOOL_ICON_MAP).map(([tool, Icon]) => (
          <ToggleButton
            key={tool}
            value={tool}
          >
            <Icon />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {showOrientationToggle && (
        <>
          <Divider flexItem orientation={oppositeOrientation} />

          <ToggleButtonGroup
            orientation={orientation}
            exclusive
            value={orientation}
            onChange={(_, orientation) => {
              preferences.setPanelOrientation(orientation);
            }}
          >
            <ToggleButton value="horizontal">
              <HorizontalSplit />
            </ToggleButton>
            <ToggleButton value="vertical">
              <VerticalSplit />
            </ToggleButton>
          </ToggleButtonGroup>
        </>
      )}

      <Divider flexItem orientation={oppositeOrientation} />
      <IconButton
        sx={{ mx: 0.5 }}
        onClick={() => {
          workspaceStore.fitToDocument();
        }}
      >
        <FitScreenIcon fontSize="medium" />
      </IconButton>
    </PaperStyled>
  );
});
