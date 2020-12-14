import React from 'react';
import { observer } from 'mobx-react';

import { PanelSlider } from '../../../../common/components/PanelSlider';
import { ratioSliderProps } from './constants';
import { usePyramidNetFactoryMst } from '../../../models';
import { VERY_SMALL_NUMBER } from '../../../../common/constants';
import { ControlElement } from '../../../../common/components/ControlElement';

export const AscendantEdgeTabsControls = observer(() => {
  const store = usePyramidNetFactoryMst();
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="tabsCount"
        min={2}
        max={5}
        step={1}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="tabDepthToTraversalLength"
        min={0.03}
        max={0.05}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="holeReachToTabDepth"
        min={0.05}
        max={0.2}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="tabRoundingDistanceRatio"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="midpointDepthToTabDepth"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="tabStartGapToTabDepth"
        min={0.3}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="tabWideningAngle"
        min={0}
        max={Math.PI / 8}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="holeWidthRatio"
        min={0.1}
        max={0.9}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="holeFlapTaperAngle"
        min={Math.PI / 16}
        max={Math.PI / 4}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={ascendantEdgeTabsSpec}
        property="flapRoundingDistanceRatio"
        {...ratioSliderProps}
      />
    </>
  );
});
