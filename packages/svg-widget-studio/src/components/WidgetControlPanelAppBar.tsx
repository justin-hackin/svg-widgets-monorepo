import { observer } from 'mobx-react';
import React, { useState } from 'react';
import {
  AppBar, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import FlareIcon from '@mui/icons-material/Flare';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { Download } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';

import { useLocation } from 'wouter';
import { useWorkspaceMst } from '../rootStore';
import { AdditionalFileMenuItems } from './AdditionalFileMenuItems';
import { assertNotNullish } from '../helpers/assert';
import { HistoryButtons } from './HistoryButtons';
import { AdditionalToolbarContent } from './AdditionalToolbarContent';
import { ControlPanelDialogs } from './ControlPanelDialogs';

export const WidgetControlPanelAppBar = observer(() => {
  const [, navigate] = useLocation();
  const workspaceStore = useWorkspaceMst();
  const { selectedStore, dialogManager } = workspaceStore;
  assertNotNullish(selectedStore);
  const {
    additionalToolbarContent,
    additionalFileMenuItems,
    history,
  } = selectedStore;

  const [fileMenuRef, setFileMenuRef] = useState<HTMLElement | null>(null);
  const resetFileMenuRef = () => {
    setFileMenuRef(null);
  };

  return (
    <AppBar position="relative">
      <Toolbar variant="dense">
        <Tooltip title="File ..." arrow>
          <IconButton
            onClick={(e) => {
              setFileMenuRef(e.currentTarget);
            }}
          >
            <FolderIcon />
          </IconButton>
        </Tooltip>
        {/*
              By default disabled elements like Button do not trigger user interactions
               thus span wrapping required by tooltip for disabled buttons
            */}
        <HistoryButtons history={history} />
        {additionalToolbarContent
          && <AdditionalToolbarContent additionalToolbarContent={additionalToolbarContent} />}
        <Menu anchorEl={fileMenuRef} open={Boolean(fileMenuRef)} keepMounted onClose={resetFileMenuRef}>
          <MenuItem onClick={() => {
            navigate('/new');
            resetFileMenuRef();
          }}
          >
            <ListItemIcon>
              <FlareIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">
              {/* no widget menu selection appears when there is only one widget registered */}
              {`New${workspaceStore.availableWidgetTypes.length > 1 ? '...' : ''}`}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            dialogManager.activateOpenWidgetFilePicker();
            resetFileMenuRef();
          }}
          >
            <ListItemIcon>
              <FolderOpenIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Open widget spec...</Typography>
          </MenuItem>
          <MenuItem onClick={() => {
            dialogManager.setDownloadPromptInitialText(selectedStore.fileBasename);
            resetFileMenuRef();
          }}
          >
            <ListItemIcon>
              <Download fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit">Download widget spec with SVG assets</Typography>
          </MenuItem>
          {additionalFileMenuItems
            && (
              <AdditionalFileMenuItems
                additionalFileMenuItems={additionalFileMenuItems}
                resetFileMenuRef={resetFileMenuRef}
              />
            )}
        </Menu>
        <IconButton
          onClick={() => {
            dialogManager.setSettingsDialogIsActive(true);
          }}
        >
          <SettingsIcon />
        </IconButton>
        <ControlPanelDialogs />
      </Toolbar>
    </AppBar>
  );
});
