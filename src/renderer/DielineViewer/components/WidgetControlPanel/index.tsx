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
import {
  AppBar, Button, Menu, MenuItem, Tooltip,
} from '@material-ui/core';
import { applySnapshot, getSnapshot } from 'mobx-state-tree';
import { Titlebar, Color } from 'custom-electron-titlebar';

import { useStyles } from '../../style';
import { EVENTS } from '../../../../main/ipc';
import { HistoryButtons } from '../PyramidNet/PyramidNetControlPanel/components/HistoryButtons';
import { useWorkspaceMst } from '../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../models/PyramidNetMakerStore';
import darkTheme from '../../data/material-ui-dark-theme';

// eslint-disable-next-line no-new
new Titlebar({
  backgroundColor: Color.fromHex(darkTheme.palette.background.default),
  menu: undefined,
});

export const WidgetControlPanel = observer(({ AdditionalFileMenuItems, AdditionalToolbarContent, PanelContent }) => {
  // @ts-ignore
  const classes = useStyles();
  useTheme();
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;

  const [fileMenuRef, setFileMenuRef] = React.useState<HTMLElement>(null);
  const resetFileMenuRef = () => { setFileMenuRef(null); };

  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => { setOpen(true); };
  const handleDrawerClose = () => { setOpen(false); };

  return (
    <div className={classes.root}>
      <Fab
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        className={clsx(classes.menuButton, open && classes.hide)}
      >
        <MenuIcon />
      </Fab>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={open}
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
              <MenuItem onClick={async () => {
                await globalThis.ipcRenderer.invoke(EVENTS.LOAD_SNAPSHOT).then((snapshot) => {
                  // falsy if file dialog cancelled
                  if (snapshot) {
                    applySnapshot(store.shapeDefinition, snapshot);
                  }
                });
                resetFileMenuRef();
              }}
              >
                Open JSON data
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await globalThis.ipcRenderer.invoke(
                    EVENTS.SAVE_NET_SVG_AND_SPEC,
                    workspaceStore.renderWidgetToString(),
                    getSnapshot(store.shapeDefinition),
                    { message: 'Save widget svg with json data', defaultPath: `${store.getFileBasename()}.svg` },
                  );
                  resetFileMenuRef();
                }}
              >
                Save to SVG w/ JSON
              </MenuItem>
              { AdditionalFileMenuItems && <AdditionalFileMenuItems resetFileMenuRef={resetFileMenuRef} />}
            </Menu>
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
