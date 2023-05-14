import React, { useState } from 'react';
import { observer } from 'mobx-react';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import Toolbar from '@mui/material/Toolbar';
import SettingsIcon from '@mui/icons-material/Settings';
import FlareIcon from '@mui/icons-material/Flare';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import {
  AppBar, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from '@mui/material';
import { SimpleDialog } from '../../common/keystone-tweakables/material-ui-controls/SimpleDialog';
import { PreferencesControls } from '../../widgets/PyramidNet/components/PreferencesControls';
import { TweakableChildrenInputs } from '../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from './AssetsAccordion';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import { HistoryButtons } from '../../widgets/PyramidNet/components/HistoryButtons';
import { useWorkspaceMst } from '../rootStore';
import { AdditionalFileMenuItems } from './AdditionalFileMenuItems';
import { AdditionalToolbarContent } from '../../widgets/PyramidNet/components/AdditionalToolbarContent';

const OPEN_TXT = 'Open';
const SAVE_TXT = 'Save';

const CLASS_BASE = 'control-panel';
const classes = {
  dielinePanelContent: `${CLASS_BASE}__panel-content`,
  closePanelButton: `${CLASS_BASE}__close-panel-button`,
  listItemIcon: `${CLASS_BASE}__list-item-icon`,
  panelToolbar: `${CLASS_BASE}__panel-toolbar`,
};

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

  const closeAlertDialog = () => workspaceStore.resetAlertDialogContent();

  const [settingsDialogIsOpen, setSettingsDialogIsOpen] = useState(false);
  const handleSettingsDialogOpen = () => {
    setSettingsDialogIsOpen(true);
  };
  const handleSettingsDialogClose = () => {
    setSettingsDialogIsOpen(false);
  };

  const newHandler = () => {
    workspaceStore.newWidget();
    resetFileMenuRef();
  };

  const openSpecHandler = async () => {
    workspaceStore.activateOpenWidgetFilePicker();
    resetFileMenuRef();
  };

  const saveHandler = async () => {
    await workspaceStore.downloadWidgetWithAssets();
    resetFileMenuRef();
  };

  return (
    <div>
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
        </Toolbar>
      </AppBar>
      <AssetsAccordion assetDefinition={selectedStore.assetDefinition} />
      <div className={classes.dielinePanelContent}>
        {PanelContent ? (<PanelContent />) : (<TweakableChildrenInputs parentNode={selectedStore} />)}
      </div>
    </div>
  );
});
