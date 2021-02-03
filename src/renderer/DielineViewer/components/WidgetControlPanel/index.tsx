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
import { applySnapshot, getSnapshot } from 'mobx-state-tree';

import { useStyles } from '../../style';
import { EVENTS } from '../../../../main/ipc';
import { HistoryButtons } from '../PyramidNet/PyramidNetControlPanel/components/HistoryButtons';
import { useWorkspaceMst } from '../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';
import { SimpleDialog } from '../../../common/components/SimpleDialog';
import { PreferencesControls } from '../PyramidNet/PyramidNetControlPanel/components/PreferencesControls';

export const WidgetControlPanel = observer(({ AdditionalFileMenuItems, AdditionalToolbarContent, PanelContent }) => {
  // @ts-ignore
  const classes = useStyles();
  useTheme();
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;

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
    store.history.clear();
    workspaceStore.setCurrentFilePath(undefined);
    resetFileMenuRef();
  };

  const openSpecHandler = async () => {
    await globalThis.ipcRenderer.invoke(EVENTS.LOAD_SNAPSHOT).then(({ fileData, filePath }) => {
      // falsy if file dialog cancelled
      if (fileData) {
        applySnapshot(store.shapeDefinition, fileData);
        workspaceStore.setCurrentFilePath(filePath);
        store.history.clear();
      }
    });
    resetFileMenuRef();
  };

  const saveAsHandler = async () => {
    const filePath = await globalThis.ipcRenderer.invoke(
      EVENTS.DIALOG_SAVE_MODEL_WITH_SVG,
      workspaceStore.renderWidgetToString(),
      getSnapshot(store.shapeDefinition),
      { message: 'Save widget svg with json data', defaultPath: `${store.getFileBasename()}.svg` },
    );
    if (!filePath) { return; }
    workspaceStore.setCurrentFilePath(filePath);
    resetFileMenuRef();
  };

  const saveHandler = async () => {
    if (!workspaceStore.currentFilePath) {
      await saveAsHandler();
      return;
    }
    const filePath = await globalThis.ipcRenderer.invoke(
      EVENTS.SAVE_MODEL_WITH_SVG,
      workspaceStore.renderWidgetToString(),
      getSnapshot(store.shapeDefinition),
      workspaceStore.currentFilePath,
    );

    if (filePath) { workspaceStore.setCurrentFilePath(filePath); }
    resetFileMenuRef();
  };

  return (
    <div className={classes.root}>
      <Fab
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, drawerIsOpen && classes.hide)}
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
        <AppBar position="sticky">
          <Toolbar className={classes.toolbar} variant="dense">
            <Tooltip title="File ..." arrow>
              <Button
                color="inherit"
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
            <HistoryButtons
              history={store.history}
            />
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
                <Typography variant="inherit">Open JSON data</Typography>
              </MenuItem>
              <MenuItem onClick={saveHandler}>
                <ListItemIcon className={classes.listItemIcon}>
                  <SaveIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Save</Typography>
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
              { AdditionalFileMenuItems && <AdditionalFileMenuItems resetFileMenuRef={resetFileMenuRef} />}
            </Menu>
            <IconButton
              color="inherit"
              onClick={handleSettingsDialogOpen}
            >
              <SettingsIcon />
            </IconButton>
            <SimpleDialog isOpen={settingsDialogIsOpen} handleClose={handleSettingsDialogClose} title="Settings">
              <PreferencesControls />
            </SimpleDialog>
            <IconButton
              color="inherit"
              className={classes.closeDielineControlsIcon}
              onClick={handleDrawerClose}
            >
              <CloseSharpIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <PanelContent />
      </Drawer>
    </div>
  );
});
