import React, { useState } from 'react';
import { observer } from 'mobx-react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import MenuIcon from '@mui/icons-material/Menu';
import FolderIcon from '@mui/icons-material/Folder';
import Toolbar from '@mui/material/Toolbar';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import SettingsIcon from '@mui/icons-material/Settings';
import FlareIcon from '@mui/icons-material/Flare';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import {
  AppBar, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from '@mui/material';

import { SnapshotInOfModel } from 'mobx-keystone';
import { styled } from '@mui/material/styles';
import { SimpleDialog } from '../../common/keystone-tweakables/material-ui-controls/SimpleDialog';
import { PreferencesControls } from '../../widgets/PyramidNet/components/PreferencesControls';
import { electronApi } from '../../../../common/electron';
import { TweakableChildrenInputs } from '../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from './AssetsAccordion';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import { HistoryButtons } from '../../widgets/PyramidNet/components/HistoryButtons';
import { useWorkspaceMst } from '../rootStore';
import { AdditionalFileMenuItems } from './AdditionalFileMenuItems';
import { AdditionalToolbarContent } from '../../widgets/PyramidNet/components/AdditionalToolbarContent';

const OPEN_TXT = 'Open';
const SAVE_TXT = 'Save';

const drawerWidth = '500px';
const CLASS_BASE = 'control-panel';
const classes = {
  drawerPaper: `${CLASS_BASE}__paper`,
  dielinePanelContent: `${CLASS_BASE}__panel-content`,
  panelOpenFab: `${CLASS_BASE}__panel-open-fab`,
  closePanelButton: `${CLASS_BASE}__close-panel-button`,
  listItemIcon: `${CLASS_BASE}__list-item-icon`,
  panelToolbar: `${CLASS_BASE}__panel-toolbar`,
};

const PanelOpenFab = styled(Fab)(({ theme }) => ({
  top: theme.spacing(1),
  right: theme.spacing(1),
  position: 'absolute',
}));

const ControlPanelDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${classes.drawerPaper}`]: {
    width: drawerWidth,
    overflow: 'unset',
    position: 'absolute',
  },
  [`& .${classes.dielinePanelContent}`]: {
    overflowY: 'auto',
  },
  [`& .${classes.closePanelButton}`]: {
    marginLeft: 'auto',
  },
  [`& .${classes.listItemIcon}`]: {
    minWidth: theme.spacing(4),
  },
  [`& .${classes.panelToolbar}`]: {
    padding: `0 ${theme.spacing(1)}`,
  },

}));

export const WidgetControlPanel = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore }: { selectedStore: BaseWidgetClass } = workspaceStore;
  const {
    additionalToolbarContent,
    additionalFileMenuItems,
    PanelContent,
    history,
  } = selectedStore;

  const [fileMenuRef, setFileMenuRef] = useState<HTMLElement>(null);
  const resetFileMenuRef = () => {
    setFileMenuRef(null);
  };

  const [drawerIsOpen, setDrawerIsOpen] = useState(true);
  const handleDrawerOpen = () => {
    setDrawerIsOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerIsOpen(false);
  };

  const closeAlertDialog = () => workspaceStore.resetAlertDialogContent();

  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false);
  const handleSettingsDialogOpen = () => {
    setSettingsDialogIsOpen(true);
  };
  const handleSettingsDialogClose = () => {
    setSettingsDialogIsOpen(false);
  };

  // TODO: move handler logic into WorkspaceModel actions
  const newHandler = () => {
    workspaceStore.newWidget();
    resetFileMenuRef();
  };

  const openSpecHandler = async () => {
    const res = await electronApi.getJsonFromDialog(OPEN_TXT);
    if (res !== undefined) {
      const { filePath } = res;
      const fileData = res.fileData as SnapshotInOfModel<any>;

      workspaceStore.initializeWidgetFromSnapshot(fileData, filePath);
    }
    resetFileMenuRef();
  };

  const saveAsHandler = async () => {
    await workspaceStore.saveWidgetWithDialog();
    resetFileMenuRef();
  };

  const saveHandler = async () => {
    await workspaceStore.saveWidget();
    resetFileMenuRef();
  };

  return (
    <>
      <PanelOpenFab
        className={classes.panelOpenFab}
        aria-label="open drawer"
        onClick={handleDrawerOpen}
      >
        <MenuIcon />
      </PanelOpenFab>
      <ControlPanelDrawer
        variant="persistent"
        anchor="right"
        open={drawerIsOpen}
        classes={{ paper: classes.drawerPaper }}
      >
        <AppBar position="relative">
          <Toolbar className={classes.panelToolbar} variant="dense">
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
              {additionalFileMenuItems
                && (
                <AdditionalFileMenuItems
                  additionalFileMenuItems={additionalFileMenuItems}
                  resetFileMenuRef={resetFileMenuRef}
                />
                )}
            </Menu>
            <IconButton
              onClick={handleSettingsDialogOpen}
            >
              <SettingsIcon />
            </IconButton>
            <SimpleDialog isOpen={!!workspaceStore.alertDialogContent} handleClose={closeAlertDialog} title="Error">
              {workspaceStore.alertDialogContent}
            </SimpleDialog>
            <SimpleDialog isOpen={settingsDialogIsOpen} handleClose={handleSettingsDialogClose} title="Settings">
              <PreferencesControls />
            </SimpleDialog>
            <IconButton
              className={classes.closePanelButton}
              onClick={handleDrawerClose}
            >
              <CloseSharpIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <AssetsAccordion assetDefinition={selectedStore.assetDefinition} />
        <div className={classes.dielinePanelContent}>
          {PanelContent ? (<PanelContent />) : (<TweakableChildrenInputs parentNode={selectedStore} />)}
        </div>
      </ControlPanelDrawer>
    </>
  );
});
