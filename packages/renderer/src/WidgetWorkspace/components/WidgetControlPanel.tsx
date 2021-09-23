import React from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import Toolbar from '@material-ui/core/Toolbar';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import SettingsIcon from '@material-ui/icons/Settings';
import FlareIcon from '@material-ui/icons/Flare';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import SaveIcon from '@material-ui/icons/Save';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import {
  AppBar, Button, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from '@material-ui/core';

import { applySnapshot, getSnapshot } from 'mobx-keystone';
import { useStyles } from '../../common/style/style';
import { useWorkspaceMst } from '../models/WorkspaceModel';
import { SimpleDialog } from '../../common/keystone-tweakables/material-ui-controls/SimpleDialog';
import { PreferencesControls } from '../../widgets/PyramidNet/components/PreferencesControls';
import { electronApi } from '../../../../common/electron';

const OPEN_TXT = 'Open';
const SAVE_TXT = 'Save';

export const WidgetControlPanel = observer(({ AdditionalFileMenuItems, PanelContent }) => {
  const classes = useStyles();
  useTheme();
  const workspaceStore = useWorkspaceMst();
  const { selectedWidgetOptions: { specFileExtension, specFileExtensionName } } = workspaceStore;
  const { selectedStore } = workspaceStore;
  const { AdditionalToolbarContent } = selectedStore;

  const [fileMenuRef, setFileMenuRef] = React.useState<HTMLElement>(null);
  const resetFileMenuRef = () => { setFileMenuRef(null); };

  const [drawerIsOpen, setDrawerIsOpen] = React.useState(true);
  const handleDrawerOpen = () => { setDrawerIsOpen(true); };
  const handleDrawerClose = () => { setDrawerIsOpen(false); };

  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = React.useState(false);
  const handleSettingsDialogOpen = () => { setSettingsDialogIsOpen(true); };
  const handleSettingsDialogClose = () => { setSettingsDialogIsOpen(false); };

  const newHandler = () => {
    workspaceStore.resetModelToDefault();
    workspaceStore.clearCurrentFileData();
    resetFileMenuRef();
  };

  const openSpecHandler = async () => {
    const res = await electronApi.getJsonFromDialog(OPEN_TXT, specFileExtension, specFileExtensionName);
    if (res) {
      const { fileData, filePath } = res;
      applySnapshot(selectedStore.savedModel, fileData);
      workspaceStore.setCurrentFileData(filePath, fileData);
    }
    resetFileMenuRef();
  };

  const saveAsHandler = async () => {
    const snapshot = getSnapshot(selectedStore.savedModel);
    const filePath = await electronApi.saveSvgAndModelWithDialog(
      workspaceStore.renderWidgetToString(),
      snapshot,
      'Save widget svg with json data',
      `${selectedStore.getFileBasename()}.${specFileExtension}`,
      specFileExtension,
      specFileExtensionName,
    );

    if (filePath) {
      workspaceStore.setCurrentFileData(filePath, snapshot);
    }
    resetFileMenuRef();
  };

  const saveHandler = async () => {
    if (!workspaceStore.currentFilePath) {
      await saveAsHandler();
      return;
    }
    const snapshot = getSnapshot(selectedStore.savedModel);
    const filePath = await electronApi.saveSvgAndModel(
      workspaceStore.renderWidgetToString(), snapshot, workspaceStore.currentFilePath,
      SAVE_TXT, specFileExtension, specFileExtensionName,
    );
    if (filePath) {
      workspaceStore.setCurrentFileData(filePath, snapshot);
    }
    resetFileMenuRef();
  };

  return (
    <>
      <Fab
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.dielinePanelFab, drawerIsOpen && classes.hide)}
      >
        <MenuIcon />
      </Fab>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={drawerIsOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <AppBar position="relative">
          <Toolbar className={classes.toolbar} variant="dense">
            <Tooltip title="File ..." arrow>
              <Button
                className={classes.dielinePanelButton}
                startIcon={<FolderIcon />}
                onClick={(e) => {
                  setFileMenuRef(e.currentTarget);
                }}
              >
                File
              </Button>
            </Tooltip>
            {/*
              By default disabled elements like Button do not trigger user interactions
               thus span wrapping required by tooltip for disabled buttons
            */}
            {AdditionalToolbarContent && <AdditionalToolbarContent />}
            <Menu anchorEl={fileMenuRef} open={Boolean(fileMenuRef)} keepMounted onClose={resetFileMenuRef}>
              <MenuItem onClick={newHandler}>
                <ListItemIcon className={classes.listItemIcon}>
                  <FlareIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">New</Typography>
              </MenuItem>
              <MenuItem onClick={openSpecHandler}>
                <ListItemIcon className={classes.listItemIcon}>
                  <FolderOpenIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{OPEN_TXT}</Typography>
              </MenuItem>
              <MenuItem onClick={saveHandler}>
                <ListItemIcon className={classes.listItemIcon}>
                  <SaveIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{SAVE_TXT}</Typography>
              </MenuItem>
              <MenuItem
                disabled={!workspaceStore.currentFileName}
                onClick={saveAsHandler}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <SaveAltIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Save as ...</Typography>
              </MenuItem>
              {AdditionalFileMenuItems && <AdditionalFileMenuItems resetFileMenuRef={resetFileMenuRef} />}
            </Menu>
            <IconButton
              className={classes.dielinePanelButton}
              onClick={handleSettingsDialogOpen}
            >
              <SettingsIcon />
            </IconButton>
            <SimpleDialog isOpen={settingsDialogIsOpen} handleClose={handleSettingsDialogClose} title="Settings">
              <PreferencesControls />
            </SimpleDialog>
            <IconButton
              className={clsx(classes.closeDielineControlsIcon, classes.dielinePanelButton)}
              onClick={handleDrawerClose}
            >
              <CloseSharpIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <PanelContent />
      </Drawer>
    </>
  );
});
