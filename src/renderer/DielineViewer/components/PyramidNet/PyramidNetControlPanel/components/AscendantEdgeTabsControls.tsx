import React from 'react';
import { observer } from 'mobx-react';

import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { VERY_SMALL_NUMBER } from '../../../../../common/constants';
import { ControlElement } from '../../../../../common/components/ControlElement';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../../models/PyramidNetMakerStore';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabsCount"
        min={2}
        max={5}
        step={1}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabDepthToTraversalLength"
        min={0.03}
        max={0.05}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="holeReachToTabDepth"
        min={0.05}
        max={0.2}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabEdgeEndpointsIndentation"
        min={0}
        max={2}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabControlPointsAngle"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabControlPointsProtrusion"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabControlPointsAngle"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="tabStartGapToTabDepth"
        min={0.3}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="holeWidthRatio"
        min={0.1}
        max={0.9}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSliderOrTextInput}
        node={ascendantEdgeTabsSpec}
        property="flapRoundingDistanceRatio"
        {...ratioSliderProps}
      />
    </>
  );
});
