import React from 'react';

import { PanelSlider } from '../../../../common/components/PanelSlider';
import { VERY_SMALL_NUMBER } from '../../../../common/util/geom';
import { ratioSliderProps } from './constants';
import { ControlElement } from './ControlElement';

export const AscendantEdgeTabsControls = () => (
  <>
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabsCount"
      min={2}
      max={5}
      step={1}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabDepthToTraversalLength"
      min={0.03}
      max={0.05}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeReachToTabDepth"
      min={0.05}
      max={0.2}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabRoundingDistanceRatio"
      {...ratioSliderProps}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.midpointDepthToTabDepth"
      {...ratioSliderProps}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabStartGapToTabDepth"
      min={0.3}
      max={1}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabWideningAngle"
      min={0}
      max={Math.PI / 8}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeWidthRatio"
      min={0.1}
      max={0.9}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeFlapTaperAngle"
      min={Math.PI / 16}
      max={Math.PI / 4}
      step={VERY_SMALL_NUMBER}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.flapRoundingDistanceRatio"
      {...ratioSliderProps}
    />
  </>
);
