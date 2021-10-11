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
import { TweakableChildrenInputs } from '../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from './AssetsAccordion';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';

const OPEN_TXT = 'Open';
const SAVE_TXT = 'Save';

export const WidgetControlPanel = observer(() => {
  const classes = useStyles();
  useTheme();
  const workspaceStore = useWorkspaceMst();
  const { selectedStore }: { selectedStore: BaseWidgetClass } = workspaceStore;
  const {
    AdditionalToolbarContent, AdditionalFileMenuItems, PanelContent, specFileExtension, specFileExtensionName,
  } = selectedStore;

  const [fileMenuRef, setFileMenuRef] = React.useState<HTMLElement>(null);
  const resetFileMenuRef = () => { setFileMenuRef(null); };

  const [drawerIsOpen, setDrawerIsOpen] = React.useState(true);
  const handleDrawerOpen = () => { setDrawerIsOpen(true); };
  const handleDrawerClose = () => { setDrawerIsOpen(false); };

  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = React.useState(false);
  const handleSettingsDialogOpen = () => { setSettingsDialogIsOpen(true); };
  const handleSettingsDialogClose = () => { setSettingsDialogIsOpen(false); };

  // TODO: move handler logic into WorkspaceModel actions
  const newHandler = () => {
    workspaceStore.resetModelToDefault();
    workspaceStore.clearCurrentFileData();
    resetFileMenuRef();
  };

  const openSpecHandler = async () => {
    const res = await electronApi.getJsonFromDialog(OPEN_TXT, specFileExtension, specFileExtensionName);
    if (res !== undefined) {
      const { fileData, filePath } = res;
      // @ts-ignore
      if (fileData.$modelName !== workspaceStore.selectedStore.$modelName) {
        // @ts-ignore
        // eslint-disable-next-line max-len
        throw new Error(`$modelName of file "${fileData.$modelName}" does not match $modelName of selectedStore "${workspaceStore.selectedStore.$modelName}"`);
      }
      applySnapshot(
        selectedStore.savedModel,
        // @ts-ignore
        fileData,
      );
      workspaceStore.setCurrentFileData(filePath, fileData);
    }
    resetFileMenuRef();
  };

  const saveAsHandler = async () => {
    const snapshot = getSnapshot(selectedStore.savedModel);
    const filePath = await electronApi.saveSvgAndAssetsWithDialog(
      workspaceStore.getSelectedModelAssetsFileData(),
      snapshot,
      'Save assets svg with widget settings',
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
    await electronApi.saveSvgAndModel(
      workspaceStore.getSelectedModelAssetsFileData(), snapshot, workspaceStore.currentFilePath,
    );
    // TODO: lose redundant setting of currentFilePath
    workspaceStore.setCurrentFileData(workspaceStore.currentFilePath, snapshot);
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
        <AssetsAccordion assetDefinition={selectedStore.assetDefinition} />
        <div className={classes.dielinePanelContent}>
          {PanelContent ? (<PanelContent />) : (<TweakableChildrenInputs parentNode={selectedStore.savedModel} />)}
        </div>
      </Drawer>
    </>
  );
});
