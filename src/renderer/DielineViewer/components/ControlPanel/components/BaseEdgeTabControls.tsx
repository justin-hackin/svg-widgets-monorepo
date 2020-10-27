import React from 'react';
import { observer } from 'mobx-react';

import { PanelSlider } from '../../../../common/components/PanelSlider';
import { VERY_SMALL_NUMBER } from '../../../../common/util/geom';
import { ratioSliderProps } from './constants';
import { ControlElement } from './ControlElement';
import { useMst } from '../../../models';
import { PanelSwitch } from '../../../../common/components/PanelSwitch';

export const BaseEdgeTabControls = observer(() => {
  const {
    pyramidNetSpec: {
      baseEdgeTabsSpec: {
        bendGuideValley,
        unsetBendGuideValley,
        resetBendGuideValleyToDefault,
      } = {},
    } = {},
  } = useMst();
  return (
    <>
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.finDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.tabDepthToAscendantTabDepth"
        min={0.6}
        max={2}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.finOffsetRatio"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeBreadthToHalfWidth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.holeTaper"
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
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.bendGuideValley.depthRatio"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSlider}
        valuePath="pyramidNetSpec.baseEdgeTabsSpec.bendGuideValley.theta"
        min={Math.PI / 16}
        max={Math.PI / 8}
        step={VERY_SMALL_NUMBER}
      />
    </>
  );
});
