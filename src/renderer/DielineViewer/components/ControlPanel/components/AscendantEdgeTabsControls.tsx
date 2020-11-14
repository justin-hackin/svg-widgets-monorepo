import React from 'react';
import { observer } from 'mobx-react';

import { PanelSlider } from '../../../../common/components/PanelSlider';
import { VERY_SMALL_NUMBER } from '../../../../common/util/geom';
import { ratioSliderProps } from './constants';
import { useMst } from '../../../models';

export const AscendantEdgeTabsControls = observer(() => {
  const store = useMst();
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabsCount"
        value={ascendantEdgeTabsSpec.tabsCount}
        setter={(val) => { ascendantEdgeTabsSpec.tabsCount = val; }}
        min={2}
        max={5}
        step={1}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabDepthToTraversalLength"
        value={ascendantEdgeTabsSpec.tabDepthToTraversalLength}
        setter={(val) => { ascendantEdgeTabsSpec.tabDepthToTraversalLength = val; }}
        min={0.03}
        max={0.05}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeReachToTabDepth"
        value={ascendantEdgeTabsSpec.holeReachToTabDepth}
        setter={(val) => { ascendantEdgeTabsSpec.holeReachToTabDepth = val; }}
        min={0.05}
        max={0.2}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabRoundingDistanceRatio"
        value={ascendantEdgeTabsSpec.tabRoundingDistanceRatio}
        setter={(val) => { ascendantEdgeTabsSpec.tabRoundingDistanceRatio = val; }}
        {...ratioSliderProps}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.midpointDepthToTabDepth"
        value={ascendantEdgeTabsSpec.midpointDepthToTabDepth}
        setter={(val) => { ascendantEdgeTabsSpec.midpointDepthToTabDepth = val; }}
        {...ratioSliderProps}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabStartGapToTabDepth"
        value={ascendantEdgeTabsSpec.tabStartGapToTabDepth}
        setter={(val) => { ascendantEdgeTabsSpec.tabStartGapToTabDepth = val; }}
        min={0.3}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.tabWideningAngle"
        value={ascendantEdgeTabsSpec.tabWideningAngle}
        setter={(val) => { ascendantEdgeTabsSpec.tabWideningAngle = val; }}
        min={0}
        max={Math.PI / 8}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeWidthRatio"
        value={ascendantEdgeTabsSpec.holeWidthRatio}
        setter={(val) => { ascendantEdgeTabsSpec.holeWidthRatio = val; }}
        min={0.1}
        max={0.9}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.holeFlapTaperAngle"
        value={ascendantEdgeTabsSpec.holeFlapTaperAngle}
        setter={(val) => { ascendantEdgeTabsSpec.holeFlapTaperAngle = val; }}
        min={Math.PI / 16}
        max={Math.PI / 4}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.ascendantEdgeTabsSpec.flapRoundingDistanceRatio"
        value={ascendantEdgeTabsSpec.flapRoundingDistanceRatio}
        setter={(val) => { ascendantEdgeTabsSpec.flapRoundingDistanceRatio = val; }}
        {...ratioSliderProps}
      />
    </>
  );
});
