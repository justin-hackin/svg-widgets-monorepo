import React from 'react';
import Divider from '@material-ui/core/Divider';
import { Paper, Tab, Tabs } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../models/PyramidNetMakerStore';
import { useStyles } from '../../../style';
import { BaseEdgeTabControls } from '../PyramidNetControlPanel/components/BaseEdgeTabControls';
import { AscendantEdgeTabsControls } from '../PyramidNetControlPanel/components/AscendantEdgeTabsControls';
import { ScoreControls } from '../PyramidNetControlPanel/components/ScoreControls';
import { ShapeSelect } from '../../../../common/components/ShapeSelect';
import { PanelSliderOrTextInput } from '../../../../common/components/PanelSliderOrTextInput';
import { PIXELS_PER_CM } from '../../../../common/util/units';

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
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const classes = useStyles();
  const { pyramidNetSpec } = store;
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
          value={pyramidNetSpec.pyramid.shapeName}
          onChange={(e) => {
            pyramidNetSpec.setPyramidShapeName(e.target.value);
          }}
          name="polyhedron-shape"
        />
        <PanelSliderOrTextInput
          node={pyramidNetSpec}
          property="shapeHeight"
          min={20 * PIXELS_PER_CM}
          max={60 * PIXELS_PER_CM}
          useUnits
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
