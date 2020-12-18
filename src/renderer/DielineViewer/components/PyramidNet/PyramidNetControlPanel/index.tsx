import React from 'react';
import { observer } from 'mobx-react';
import { startCase } from 'lodash';
import clsx from 'clsx';
import { useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import FolderIcon from '@material-ui/icons/Folder';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Toolbar from '@material-ui/core/Toolbar';
import CloseSharpIcon from '@material-ui/icons/CloseSharp';
import {
  AppBar, Button, Menu, MenuItem, Paper, Tab, Tabs, Tooltip,
} from '@material-ui/core';

import { PanelSelect } from '../../../../common/components/PanelSelect';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { useStyles } from '../../../style';
import { EVENTS } from '../../../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../../../common/util/svg';
import { StyleControls } from './components/StyleControls';
import { BaseEdgeTabControls } from './components/BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from './components/AscendantEdgeTabsControls';
import { ScoreControls } from './components/ScoreControls';
import { HistoryButtons } from './components/HistoryButtons';
import { VERY_SMALL_NUMBER } from '../../../../common/constants';
import { ControlElement } from '../../../../common/components/ControlElement';
import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';

const controlsTabs = [
  {
    label: 'Base',
    title: 'Base Edge Tab',
    component: BaseEdgeTabControls,
  },
  {
    label: 'Asc.',
    title: 'Ascendant Edge Tab',
    component: AscendantEdgeTabsControls,
  },
  {
    label: 'Score',
    title: 'Score Pattern',
    component: ScoreControls,
  },
  {
    label: 'Style',
    title: 'Dieline Style',
    component: StyleControls,
  },
];

const AdditionalToolbarContent = () => {
  const handleOpenTextureEditor = () => { globalThis.ipcRenderer.send(EVENTS.OPEN_TEXTURE_WINDOW); };

  return (
    <Tooltip title="Open/reveal texture editor" arrow>
      <Button
        color="inherit"
        startIcon={<OpenInNewIcon />}
        onClick={handleOpenTextureEditor}
      >
        Texture
      </Button>
    </Tooltip>
  );
};

const PanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const classes = useStyles();
  const { pyramidNetSpec } = store;
  const polyhedronOptions = Object.keys(store.polyhedraPyramidGeometries)
    .map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

  const [activeControlsIndex, setActiveControlsIndex] = React.useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveControlsIndex(newValue);
  };

  return (
    <>
      <div className={classes.shapeSection}>
        <h3>Shape</h3>
        <ControlElement
          component={PanelSelect}
          node={pyramidNetSpec.pyramid}
          property="shapeName"
          label="Polyhedron"
          options={polyhedronOptions}
        />
        <ControlElement
          component={PanelSlider}
          node={pyramidNetSpec}
          property="shapeHeightInCm"
          min={20}
          max={60}
          step={VERY_SMALL_NUMBER}
        />
      </div>
      <Divider />
      <Paper square>
        <Tabs
          value={activeControlsIndex}
          indicatorColor="primary"
          textColor="primary"
          centered
          onChange={handleTabChange}
        >
          {controlsTabs.map(({ label }, index) => (
            <Tab className={classes.dielineToolbarTab} label={label} key={index} />))}
        </Tabs>
      </Paper>
      <div className={classes.tabContent}>
        <h3>{controlsTabs[activeControlsIndex].title}</h3>
        {React.createElement(controlsTabs[activeControlsIndex].component)}
      </div>
    </>
  );
};

const AdditionalMenuItems = ({ resetFileMenuRef }) => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  return (
    <>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.SAVE_SVG, store.renderDecorationBoundaryToString(), {
          message: 'Save face template',
          defaultPath: `${store.pyramidNetSpec.pyramid.shapeName}__template.svg`,
        });
        resetFileMenuRef();
      }}
      >
        Download face template SVG (current shape)
      </MenuItem>
      <MenuItem onClick={async () => {
        await globalThis.ipcRenderer.invoke(EVENTS.OPEN_SVG, 'Upload face cut pattern')
          .then((svgString) => {
            const d = extractCutHolesFromSvgString(svgString);
            store.pyramidNetSpec.setActiveCutHolePatternD(d);
          });
        resetFileMenuRef();
      }}
      >
        Import face cut path from template
      </MenuItem>
    </>
  );
};
export const PyramidNetControlPanel = observer(() => {
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
            <AdditionalToolbarContent />
            <HistoryButtons
              history={store.history}
            />
            <Menu anchorEl={fileMenuRef} open={Boolean(fileMenuRef)} keepMounted onClose={resetFileMenuRef}>
              <MenuItem onClick={async () => {
                await globalThis.ipcRenderer.invoke(EVENTS.LOAD_NET_SPEC).then((specData) => {
                  // falsy if file dialog cancelled
                  if (specData) {
                    store.shapeDefinition.loadSpec(specData);
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
                    store.shapeDefinition,
                    { message: 'Save widget svg with json data', defaultPath: store.getFileBasename() },
                  );
                  resetFileMenuRef();
                }}
              >
                Save to SVG w/ JSON
              </MenuItem>
              <AdditionalMenuItems resetFileMenuRef={resetFileMenuRef} />
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
