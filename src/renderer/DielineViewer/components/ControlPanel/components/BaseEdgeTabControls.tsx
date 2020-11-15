import React from 'react';
import { observer } from 'mobx-react';

import { PanelSlider } from '../../../../common/components/PanelSlider';
import { ratioSliderProps } from './constants';
import { usePyramidNetFactoryMst } from '../../../models';
import { PanelSwitch } from '../../../../common/components/PanelSwitch';
import { VERY_SMALL_NUMBER } from '../../../../common/constants';

export const BaseEdgeTabControls = observer(() => {
  const {
    pyramidNetSpec: {
      baseEdgeTabsSpec,
    } = {},
  } = usePyramidNetFactoryMst();
  const {
    bendGuideValley,
    unsetBendGuideValley,
    resetBendGuideValleyToDefault,
  } = baseEdgeTabsSpec;

  return (
    <>
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.finDepthToTabDepth"
        value={baseEdgeTabsSpec.finDepthToTabDepth}
        setter={(value) => { baseEdgeTabsSpec.finDepthToTabDepth = value; }}
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.tabDepthToAscendantTabDepth"
        value={baseEdgeTabsSpec.tabDepthToAscendantTabDepth}
        setter={(value) => { baseEdgeTabsSpec.tabDepthToAscendantTabDepth = value; }}
        min={0.6}
        max={2}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeDepthToTabDepth"
        value={baseEdgeTabsSpec.holeDepthToTabDepth}
        setter={(value) => { baseEdgeTabsSpec.holeDepthToTabDepth = value; }}
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.finOffsetRatio"
        value={baseEdgeTabsSpec.finOffsetRatio}
        setter={(value) => { baseEdgeTabsSpec.finOffsetRatio = value; }}
        {...ratioSliderProps}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeBreadthToHalfWidth"
        value={baseEdgeTabsSpec.holeBreadthToHalfWidth}
        setter={(value) => { baseEdgeTabsSpec.holeBreadthToHalfWidth = value; }}
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSlider
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeTaper"
        value={baseEdgeTabsSpec.holeTaper}
        setter={(value) => { baseEdgeTabsSpec.holeTaper = value; }}
        min={Math.PI / 8}
        max={Math.PI / 3}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSwitch
        label="Use Bend Guide Valley"
        valuePath="BaseEdgeTabControls__useBendGuideValley"
        value={!!bendGuideValley}
        setter={(useBendGuideValleyOn) => {
          if (useBendGuideValleyOn) {
            resetBendGuideValleyToDefault();
          } else {
            unsetBendGuideValley();
          }
        }}
      />
      {baseEdgeTabsSpec.bendGuideValley && (
        <>
          <PanelSlider
            valuePath="pyramidNetSpec.baseEdgeTabsSpec.bendGuideValley.depthRatio"
            value={baseEdgeTabsSpec.bendGuideValley.depthRatio}
            setter={(value) => { baseEdgeTabsSpec.bendGuideValley.depthRatio = value; }}
            {...ratioSliderProps}
          />
          <PanelSlider
            valuePath="pyramidNetSpec.baseEdgeTabsSpec.bendGuideValley.theta"
            value={baseEdgeTabsSpec.bendGuideValley.theta}
            setter={(value) => { baseEdgeTabsSpec.bendGuideValley.theta = value; }}
            min={Math.PI / 16}
            max={Math.PI / 3}
            step={VERY_SMALL_NUMBER}
          />
        </>
      )}
    </>
  );
});
