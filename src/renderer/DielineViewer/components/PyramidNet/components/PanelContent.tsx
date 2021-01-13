import React from 'react';
import { startCase } from 'lodash';
import Divider from '@material-ui/core/Divider';
import { Paper, Tab, Tabs } from '@material-ui/core';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';
import { useStyles } from '../../../style';
import { ControlElement } from '../../../../common/components/ControlElement';
import { PanelSelect } from '../../../../common/components/PanelSelect';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { VERY_SMALL_NUMBER } from '../../../../common/constants';
import { BaseEdgeTabControls } from '../PyramidNetControlPanel/components/BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from '../PyramidNetControlPanel/components/AscendantEdgeTabsControls';
import { ScoreControls } from '../PyramidNetControlPanel/components/ScoreControls';
import { StyleControls } from '../PyramidNetControlPanel/components/StyleControls';

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

export const PanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const classes = useStyles();
  const { pyramidNetSpec } = store;
  if (!pyramidNetSpec) { return null; }
  const polyhedronOptions = Object.keys(store.polyhedraPyramidGeometries)
    .map((polyKey) => ({
      value: polyKey,
      label: startCase(polyKey),
    }));

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
          onChange={(e) => {
            pyramidNetSpec.setPyramidShapeName(e.target.value);
          }}
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
