import React from 'react';
import { observer } from 'mobx-react';

import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { DEFAULT_SLIDER_STEP } from '../../../../../common/constants';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetPluginModel;
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabsCount"
        min={2}
        max={5}
        step={1}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabDepthToTraversalLength"
        min={0.03}
        max={0.05}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="holeReachToTabDepth"
        min={0.05}
        max={0.2}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabEdgeEndpointsIndentation"
        min={0}
        max={2}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabControlPointsAngle"
        {...ratioSliderProps}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabControlPointsProtrusion"
        {...ratioSliderProps}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="tabStartGapToTabDepth"
        min={0.3}
        max={1}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="holeWidthRatio"
        min={0.1}
        max={0.9}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={ascendantEdgeTabsSpec}
        property="flapRoundingDistanceRatio"
        {...ratioSliderProps}
      />
    </>
  );
});
