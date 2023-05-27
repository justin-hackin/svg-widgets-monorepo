import React from 'react';
import { observer } from 'mobx-react';
import { SimpleSwitch, TweakableChildrenInputs, useSelectedStore } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { BendGuideValleyModel } from '../baseEdgeConnectionTab';

export const BaseEdgeTabControls = observer(() => {
  const {
    baseEdgeTabsSpec,
  } = useSelectedStore<PyramidNetWidgetModel>();

  return (
    <>
      <TweakableChildrenInputs parentNode={baseEdgeTabsSpec} />

      <SimpleSwitch
        label="Use Bend Guide Valley"
        name="BaseEdgeTabControls__useBendGuideValley"
        value={!!baseEdgeTabsSpec.bendGuideValley}
        onChange={(e) => {
          if (e.target.checked) {
            baseEdgeTabsSpec.resetBendGuideValleyToDefault();
          } else {
            baseEdgeTabsSpec.unsetBendGuideValley();
          }
        }}
      />
      {baseEdgeTabsSpec.bendGuideValley instanceof BendGuideValleyModel && (
        <TweakableChildrenInputs parentNode={baseEdgeTabsSpec.bendGuideValley} />
      )}
    </>
  );
});
