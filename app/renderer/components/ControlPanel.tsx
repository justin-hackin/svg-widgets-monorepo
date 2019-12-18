import React from 'react';
import { observer } from 'mobx-react';
import startCase from 'lodash-es/startCase';
import last from 'lodash-es/last';

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
import { ControlsExpansionPanel } from './ControlsExpansionPanel';
import { PanelColorPicker } from './inputs/PanelColorPicker';
import { dashPatterns } from '../data/dash-patterns';

const VERY_SMALL_NUMBER = 0.00000001;

export const ControlPanel = observer(({ store }) => {
  // @ts-ignore
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  const { polyhedraPyramidGeometries } = store;
  const polyhedronOptions = Object.keys(polyhedraPyramidGeometries)
    .map((polyKey) => ({ value: polyKey, label: startCase(polyKey) }));

  const [open, setOpen] = React.useState(false);

  const mapControlsSpecToComponents = ({
    component, valuePath, label, ...props
  }) => {
    const extraProps = {
      setter: (value) => { store.setValueAtPath(valuePath, value); },
      value: get(store, valuePath),
      valuePath,
      key: valuePath,
      label: label || startCase(last((valuePath.split('.')))),
    };
    return React.createElement(component, { ...props, ...extraProps });
  };
  const ratioSliderProps = { min: 0, max: 1, step: VERY_SMALL_NUMBER };
  const strokeLengthProps = { min: 1, max: 3000, step: VERY_SMALL_NUMBER };

  const styleControls = [{
    component: PanelSlider,
    valuePath: 'styleSpec.dieLineProps.strokeWidth',
    label: 'Dieline Stroke',
    min: 0,
    max: 3,
    step: 0.01,
  }, {
    component: PanelColorPicker,
    label: 'Cut Stroke Color',
    valuePath: 'styleSpec.cutLineProps.stroke',
  }, {
    component: PanelColorPicker,
    label: 'Score Stroke Color',
    valuePath: 'styleSpec.scoreLineProps.stroke',
  }, {
    component: PanelColorPicker,
    label: 'Design Boundary Fill',
    valuePath: 'styleSpec.designBoundaryProps.fill',
  }]
  // @ts-ignore
    .map(mapControlsSpecToComponents);
  const dashPatternOptions = Object.entries(dashPatterns).map(([key, { label }]) => ({ value: key, label }));
  const strokeControls = [{
    component: PanelSelect,
    valuePath: 'pyramidNetSpec.interFaceScoreDashSpec.strokeDashPathPatternId',
    label: 'Inter-face Stroke Pattern',
    options: dashPatternOptions,
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.interFaceScoreDashSpec.strokeDashLength',
    label: 'Inter-face Stroke Dash Length',
    ...strokeLengthProps,
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.interFaceScoreDashSpec.strokeDashOffsetRatio',
    label: 'Inter-face Stroke Dash Offset Ratio',
    ...ratioSliderProps,
  }, {
    component: PanelSelect,
    valuePath: 'pyramidNetSpec.baseScoreDashSpec.strokeDashPathPatternId',
    label: 'Base Stroke Pattern',
    options: dashPatternOptions,
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.baseScoreDashSpec.strokeDashLength',
    label: 'Base Stroke Dash Length',
    ...strokeLengthProps,
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.baseScoreDashSpec.strokeDashOffsetRatio',
    label: 'Base Stroke Dash Offset Ratio',
    ...ratioSliderProps,
  }]
  // @ts-ignore
    .map(mapControlsSpecToComponents);

  const topLevelControls = [{
    component: PanelSelect,
    valuePath: 'pyramidNetSpec.pyramidGeometryId',
    label: 'Polyhedron',
    options: polyhedronOptions,
  }, {
    component: PanelSlider,
    valuePath: 'pyramidNetSpec.shapeHeightInCm',
    min: 20,
    max: 60,
    step: VERY_SMALL_NUMBER,
  }]
  // @ts-ignore
    .map(mapControlsSpecToComponents);


  const baseEdgeTabControl = [
    {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.finDepthToTabDepth',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.finTipDepthToFinDepth',
      min: 0.9,
      max: 1.5,
      step: 0.0001,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.holeBreadthToHalfWidth',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.holeDepthToTabDepth',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.holeTaper',
      min: Math.PI / 8,
      max: Math.PI / 3,
      step: VERY_SMALL_NUMBER,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.roundingDistanceRatio',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.baseEdgeTabSpec.tabDepthToAscendantEdgeLength',
      min: 0.6,
      max: 2,
      step: VERY_SMALL_NUMBER,
    },
    // @ts-ignore
  ].map(mapControlsSpecToComponents);
  const ascendantEdgeTabsControl = [
    {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.flapRoundingDistanceRatio',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.holeFlapTaperAngle',
      min: Math.PI / 12,
      max: Math.PI / 8,
      step: 0.00000001,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.holeReachToTabDepth',
      min: 0.05,
      max: 0.2,
      step: VERY_SMALL_NUMBER,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.holeWidthRatio',
      min: 0.1,
      max: 0.9,
      step: VERY_SMALL_NUMBER,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.midpointDepthToTabDepth',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabDepthToTraversalLength',
      min: 0.03,
      max: 0.05,
      step: VERY_SMALL_NUMBER,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabRoundingDistanceRatio',
      ...ratioSliderProps,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabsCount',
      min: 2,
      max: 5,
      step: 1,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabStartGapToTabDepth',
      min: 0.3,
      max: 1,
      step: VERY_SMALL_NUMBER,
    }, {
      component: PanelSlider,
      valuePath: 'pyramidNetSpec.ascendantEdgeTabsSpec.tabWideningAngle',
      min: Math.PI / 8,
      max: Math.PI / 4,
      step: VERY_SMALL_NUMBER,
    },
    // @ts-ignore
  ].map(mapControlsSpecToComponents);

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

        <ControlsExpansionPanel summary="Path Styles">
          {styleControls}
        </ControlsExpansionPanel>

        {topLevelControls}

        <ControlsExpansionPanel summary="Stroke">
          {strokeControls}
        </ControlsExpansionPanel>

        <ControlsExpansionPanel summary="Ascendant Edge Tabs">
          {ascendantEdgeTabsControl}
        </ControlsExpansionPanel>

        <ControlsExpansionPanel summary="Base Edge Tab">
          {baseEdgeTabControl}
        </ControlsExpansionPanel>
      </Drawer>
    </div>
  );
});
