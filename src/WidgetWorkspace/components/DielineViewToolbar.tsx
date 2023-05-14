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
import { WorkspaceModel } from '../models/WorkspaceModel';
import { useWorkspaceMst } from '../rootStore';

const TOOL_ICON_MAP = {
  [TOOL_PAN]: PanToolIcon,
  [TOOL_ZOOM_IN]: ZoomInIcon,
  [TOOL_ZOOM_OUT]: ZoomOutIcon,
};

const PaperStyled = styled(Paper)(({ theme }) => ({
  flexDirection: 'column',
  position: 'fixed',
  top: theme.spacing(1),
  left: theme.spacing(1),
  padding: theme.spacing(0.5),
}));

export const DielineViewToolbar = observer(() => {
  const workspaceStore: WorkspaceModel = useWorkspaceMst();
  const { zoomPanTool } = workspaceStore;

  return (
    <PaperStyled elevation={3}>
      <ToggleButtonGroup
        orientation="vertical"
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
      <Divider flexItem orientation="horizontal" sx={{ my: 1, mx: 0.5 }} />
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
