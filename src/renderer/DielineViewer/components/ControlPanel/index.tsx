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
import Toolbar from '@material-ui/core/Toolbar';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import SaveIcon from '@material-ui/icons/Save';
import ArchiveIcon from '@material-ui/icons/Archive';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import DescriptionIcon from '@material-ui/icons/Description';
import ControlCameraIcon from '@material-ui/icons/ControlCamera';
import { PanelSelect } from '../../../common/components/PanelSelect';
import { PanelSlider } from '../../../common/components/PanelSlider';
import { useStyles } from '../../style';
import { ControlsAccordion } from './components/ControlsAccordion';
import { VERY_SMALL_NUMBER } from '../../../common/util/geom';
import { EVENTS } from '../../../../main/ipc';
import { extractCutHolesFromSvgString } from '../../../../common/util/svg';
import { useMst } from '../../models';
import { ControlElement } from './components/ControlElement';
import { StyleControls } from './components/StyleControls';
import { BaseEdgeTabControls } from './components/BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from './components/AscendantEdgeTabsControls';

export const ControlPanel = observer(() => {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const store = useMst();
  const { polyhedraPyramidGeometries } = store;
  const polyhedronOptions = Object.keys(polyhedraPyramidGeometries)
    .map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

  const [open, setOpen] = React.useState(true);


  // eslint-disable-next-line @typescript-eslint/no-unused-vars


  const handleDrawerOpen = () => { setOpen(true); };

  const handleDrawerClose = () => { setOpen(false); };

  const handleOpenTextureEditor = () => { globalThis.ipcRenderer.send(EVENTS.OPEN_TEXTURE_WINDOW); };

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
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar className={classes.dielineToolbar}>
          <IconButton
            aria-label="save"
            onClick={() => {
              globalThis.ipcRenderer.invoke(EVENTS.LOAD_NET_SPEC).then((netSpecData) => {
                store.pyramidNetSpec.loadSpec(netSpecData);
              });
            }}
          >
            <DescriptionIcon />
          </IconButton>

          <IconButton
            aria-label="save"
            onClick={() => {
              globalThis.ipcRenderer.invoke(
                EVENTS.SAVE_NET_SVG_AND_SPEC,
                store.renderPyramidNetToString(),
                store.pyramidNetSpec,
                'Save pyramid net dielines and model',
              );
            }}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              globalThis.ipcRenderer.invoke(EVENTS.SAVE_SVG, store.renderFaceBoundaryToString(), {
                message: 'Save face template',
                defaultPath: `${store.pyramidNetSpec.pyramid.shapeName}__template.svg`,
              });
            }}
          >
            <ArchiveIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              globalThis.ipcRenderer.invoke(EVENTS.OPEN_SVG, 'Upload face cut pattern')
                .then((svgString) => {
                  const d = extractCutHolesFromSvgString(svgString);
                  store.pyramidNetSpec.setActiveCutHolePatternD(d);
                });
            }}
          >
            <BlurOnIcon />
          </IconButton>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />

        <div className={classes.drawerContent}>
          <ControlElement
            component={PanelSelect}
            valuePath="pyramidNetSpec.pyramid.shapeName"
            label="Polyhedron"
            options={polyhedronOptions}
          />
          <ControlElement
            component={PanelSlider}
            valuePath="pyramidNetSpec.shapeHeightInCm"
            min={20}
            max={60}
            step={VERY_SMALL_NUMBER}
          />

          <ControlsAccordion summary="Ascendant Edge Tabs">
            <AscendantEdgeTabsControls />
          </ControlsAccordion>

          <ControlsAccordion summary="Base Edge Tab">
            <BaseEdgeTabControls />
          </ControlsAccordion>

          {/* TODO: re-add stroke controls when refined */}
          {/* <ControlsAccordion summary="Stroke"> */}
          {/*  <StrokeControls /> */}
          {/* </ControlsAccordion> */}

          <ControlsAccordion summary="Path Styles">
            <StyleControls />
          </ControlsAccordion>
        </div>
      </Drawer>
      <Fab
        color="inherit"
        aria-label="open texture editor"
        onClick={handleOpenTextureEditor}
        className={classes.openTextureButton}
      >
        <ControlCameraIcon />
      </Fab>
    </div>
  );
});
