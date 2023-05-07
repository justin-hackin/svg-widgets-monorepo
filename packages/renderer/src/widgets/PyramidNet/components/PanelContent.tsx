import React from 'react';
import Divider from '@mui/material/Divider';
import { Paper, Tab, Tabs } from '@mui/material';
import { observer } from 'mobx-react';

import { styled } from '@mui/styles';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { BaseEdgeTabControls } from './BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from './AscendantEdgeTabsControls';
import { ShapeSelect } from './ShapeSelect';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { TweakableInput } from '../../../common/keystone-tweakables/material-ui-controls/TweakableInput';

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
  // {
  //   label: 'Score',
  //   title: 'Score Pattern',
  //   component: ScoreControls,
  // },
];
const classes = {
  shapeHeightFormControl: 'shape-height-form-control',
};

const TabContent = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  flexDirection: 'column',
}));
const ShapeSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  [`& .${classes.shapeHeightFormControl}`]: {
    // additional specificity not needed in dev build but this style not applied in production build
    '&.MuiFormControl-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

export const PanelContent = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetWidgetModel;
  if (!store) { return null; }
  const { pyramid, shapeHeight } = store;

  const [activeControlsIndex, setActiveControlsIndex] = React.useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveControlsIndex(newValue);
  };

  return (
    <>
      <ShapeSection>
        <ShapeSelect
          node={pyramid.shapeName}
        />
        <TweakableInput
          className={classes.shapeHeightFormControl}
          node={shapeHeight}
        />
        <TweakableInput node={pyramid.netsPerPyramid} />
      </ShapeSection>
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
      <TabContent>
        <h3>{controlsTabs[activeControlsIndex].title}</h3>
        {React.createElement(controlsTabs[activeControlsIndex].component)}
      </TabContent>
    </>
  );
});
