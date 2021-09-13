import React from 'react';
import Divider from '@material-ui/core/Divider';
import { Paper, Tab, Tabs } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { useStyles } from '../../../../../common/style/style';
import { BaseEdgeTabControls } from '../PyramidNetControlPanel/components/BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from '../PyramidNetControlPanel/components/AscendantEdgeTabsControls';
import { ScoreControls } from '../PyramidNetControlPanel/components/ScoreControls';
import { ShapeSelect } from '../../../../../common/components/ShapeSelect';
import { PyramidNetPluginModel } from '../../../models/PyramidNetMakerStore';
import { TweakableInput } from '../../../../../common/components/TweakableInput';

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
];

export const PanelContent = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetPluginModel;
  const classes = useStyles();
  const { pyramidNetSpec } = store;
  const { pyramid } = pyramidNetSpec;

  if (!pyramidNetSpec) { return null; }

  const [activeControlsIndex, setActiveControlsIndex] = React.useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveControlsIndex(newValue);
  };

  return (
    <>
      <div className={classes.shapeSection}>
        <ShapeSelect
          className={classes.shapeSelect}
          node={pyramidNetSpec.pyramid.shapeName}
        />
        <TweakableInput
          className={classes.shapeHeightFormControl}
          node={pyramidNetSpec.shapeHeight}
        />
        <TweakableInput node={pyramid.netsPerPyramid} />
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
            <Tab label={label} key={index} />))}
        </Tabs>
      </Paper>
      <div className={classes.tabContent}>
        <h3>{controlsTabs[activeControlsIndex].title}</h3>
        {React.createElement(controlsTabs[activeControlsIndex].component)}
      </div>
    </>
  );
});
