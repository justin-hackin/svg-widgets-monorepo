import React from 'react';
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
  AppBar, Button, ListItemIcon, Menu, MenuItem, Tooltip, Typography,
} from '@mui/material';

import { applySnapshot, getSnapshot } from 'mobx-keystone';
import { styled } from '@mui/material/styles';
import { panelButtonStyles } from '../../common/style/style';
import { useWorkspaceMst } from '../models/WorkspaceModel';
import { SimpleDialog } from '../../common/keystone-tweakables/material-ui-controls/SimpleDialog';
import { PreferencesControls } from '../../widgets/PyramidNet/components/PreferencesControls';
import { electronApi } from '../../../../common/electron';
import { TweakableChildrenInputs } from '../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from './AssetsAccordion';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';

const OPEN_TXT = 'Open';
const SAVE_TXT = 'Save';

const MyIconButton = styled(IconButton)({
  ...panelButtonStyles,
});

const CloseIconButton = styled(MyIconButton)({
  marginLeft: 'auto',
});

const DielinePanelFab = styled(Fab)(({ theme }) => ({
  top: theme.spacing(1),
  right: theme.spacing(1),
  position: 'absolute',
}));

const DielinePanelContent = styled('div')({
  overflowY: 'auto',
});

const drawerWidth = '500px';
const drawerPaperClass = 'control-panel-paper';
const ControlPanelDrawer = styled(Drawer)({
  [`& .${drawerPaperClass}`]: {
    width: drawerWidth,
    overflow: 'unset',
    position: 'absolute',
  },
});

const MyListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: theme.spacing(4),
}));

const ControlPanelToolbar = styled(Toolbar)(({ theme }) => ({
  padding: `0 ${theme.spacing(1)}`,
}));

export const WidgetControlPanel = observer(() => {
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
      <DielinePanelFab
        aria-label="open drawer"
        onClick={handleDrawerOpen}
      >
        <MenuIcon />
      </DielinePanelFab>
      <ControlPanelDrawer
        variant="persistent"
        anchor="right"
        open={drawerIsOpen}
        classes={{ paper: drawerPaperClass }}
      >
        <AppBar position="relative">
          <ControlPanelToolbar variant="dense">
            <Tooltip title="File ..." arrow>
              <Button
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
                <MyListItemIcon>
                  <FlareIcon fontSize="small" />
                </MyListItemIcon>
                <Typography variant="inherit">New</Typography>
              </MenuItem>
              <MenuItem onClick={openSpecHandler}>
                <MyListItemIcon>
                  <FolderOpenIcon fontSize="small" />
                </MyListItemIcon>
                <Typography variant="inherit">{OPEN_TXT}</Typography>
              </MenuItem>
              <MenuItem onClick={saveHandler}>
                <MyListItemIcon>
                  <SaveIcon fontSize="small" />
                </MyListItemIcon>
                <Typography variant="inherit">{SAVE_TXT}</Typography>
              </MenuItem>
              <MenuItem
                disabled={!workspaceStore.currentFileName}
                onClick={saveAsHandler}
              >
                <MyListItemIcon>
                  <SaveAltIcon fontSize="small" />
                </MyListItemIcon>
                <Typography variant="inherit">Save as ...</Typography>
              </MenuItem>
              {AdditionalFileMenuItems && <AdditionalFileMenuItems resetFileMenuRef={resetFileMenuRef} />}
            </Menu>
            <MyIconButton
              onClick={handleSettingsDialogOpen}
            >
              <SettingsIcon />
            </MyIconButton>
            <SimpleDialog isOpen={settingsDialogIsOpen} handleClose={handleSettingsDialogClose} title="Settings">
              <PreferencesControls />
            </SimpleDialog>
            <CloseIconButton
              onClick={handleDrawerClose}
            >
              <CloseSharpIcon />
            </CloseIconButton>
          </ControlPanelToolbar>
        </AppBar>
        <AssetsAccordion assetDefinition={selectedStore.assetDefinition} />
        <DielinePanelContent>
          {PanelContent ? (<PanelContent />) : (<TweakableChildrenInputs parentNode={selectedStore.savedModel} />)}
        </DielinePanelContent>
      </ControlPanelDrawer>
    </>
  );
});
