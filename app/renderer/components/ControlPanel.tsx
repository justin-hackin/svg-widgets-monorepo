import React from 'react';
import { observer } from 'mobx-react';
import startCase from 'lodash-es/startCase';
import get from 'lodash-es/get';
import clsx from 'clsx';
import {
  useTheme,
} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import SaveIcon from '@material-ui/icons/Save';
import ArchiveIcon from '@material-ui/icons/Archive';
import BlurOnIcon from '@material-ui/icons/BlurOn';
import DescriptionIcon from '@material-ui/icons/Description';
import { PanelSelect } from './inputs/PanelSelect';
import { PanelSlider } from './inputs/PanelSlider';
import { useStyles } from './style';

export const ControlPanel = observer(({ store }) => {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { polyhedraPyramidGeometries } = store;
  const polyhedronOptions = Object.keys(polyhedraPyramidGeometries)
    .map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

  const [open, setOpen] = React.useState(false);

  const controlsSpec = [{
    component: PanelSlider,
    valuePath: 'styleSpec.dieLineProps.strokeWidth',
    props: {
      label: 'Dieline Stroke',
      min: 0,
      max: 3,
      step: 0.01,
    },
  }, {
    component: PanelSelect,
    valuePath: 'pyramidNetSpec.pyramidGeometryId',
    props: {
      label: 'Polyhedron', options: polyhedronOptions,
    },
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabDepthToAscendantEdgeLength',
    props: {
      label: 'Tab Depth To Ascendant Edge Length', min: 0, max: 3, step: 0.01,
    },
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabsCount',
    props: {
      label: 'Ascendant Tab Count', min: 2, max: 5, step: 1,
    },
  }];

  const controlElements = controlsSpec.map(({ props, component, valuePath }) => {
    const storeProps = {
      setter: (value) => { store.setValueAtPath(valuePath, value); },
      value: get(store, valuePath),
      key: valuePath,
    };
    return React.createElement(component, { ...props, ...storeProps });
  });


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
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
        <div className={classes.drawerHeader}>
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('load-net-spec').then((netSpecData) => {
                store.pyramidNetSpec.loadSpec(netSpecData);
              });
            }}
          >
            <DescriptionIcon />
          </IconButton>

          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke(
                'save-net-with-data',
                store.renderPyramidNetToString(),
                store.pyramidNetSpec.exportToJSONString(),
                'Save pyramid net dielines and model',
              );
            }}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('save-svg', store.renderFaceBoundaryToString(), 'Save face template');
            }}
          >
            <ArchiveIcon />
          </IconButton>
          <IconButton
            aria-label="save"
            onClick={() => {
              // @ts-ignore
              ipcRenderer.invoke('open-svg', 'Upload face cut pattern')
                .then((svgString) => {
                  store.pyramidNetSpec.applyFaceHolePattern(svgString);
                });
            }}
          >
            <BlurOnIcon />
          </IconButton>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />

        {controlElements}
      </Drawer>
    </div>
  );
});
