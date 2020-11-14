import React from 'react';
import { observer } from 'mobx-react';

import { VERY_SMALL_NUMBER } from '../../../../common/util/geom';
import { PanelSelect } from '../../../../common/components/PanelSelect';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { ratioSliderProps } from './constants';
import { PanelSwitch } from '../../../../common/components/PanelSwitch';
import { usePyramidNetFactoryMst } from '../../../models';

const strokeLengthProps = { min: 1, max: 3000, step: VERY_SMALL_NUMBER };

export const ScoreControls = observer(() => {
  const {
    pyramidNetSpec: {
      useDottedStroke, setUseDottedStroke,
      interFaceScoreDashSpec, baseScoreDashSpec, setInterFaceScoreDashSpecPattern, setBaseScoreDashSpecPattern,
    } = {}, dashPatterns,
  } = usePyramidNetFactoryMst();
  const dashPatternOptions = dashPatterns.map(({ label, id }) => ({ value: id, label }));
  return (
    <>
      <PanelSwitch
        value={useDottedStroke}
        valuePath="pyramidNetSpec.useDottedStroke"
        setter={(val) => { setUseDottedStroke(val); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>

          <PanelSelect
            valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashPathPattern.id"
            value={interFaceScoreDashSpec.strokeDashPathPattern.id}
            label="Inter-face stroke dash pattern"
            setter={(id) => {
              setInterFaceScoreDashSpecPattern(id);
            }}
            options={dashPatternOptions}
          />
          <PanelSlider
            valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashLength"
            label="Inter-face Stroke Dash Length"
            value={interFaceScoreDashSpec.strokeDashLength}
            setter={(val) => {
              interFaceScoreDashSpec.strokeDashLength = val;
            }}
            {...strokeLengthProps}
          />
          <PanelSlider
            valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashOffsetRatio"
            label="Inter-face Stroke Dash Offset Ratio"
            value={interFaceScoreDashSpec.strokeDashOffsetRatio}
            setter={(val) => {
              interFaceScoreDashSpec.strokeDashOffsetRatio = val;
            }}
            {...ratioSliderProps}
          />
          <PanelSelect
            valuePath="baseScoreDashSpec.strokeDashPathPattern.id"
            value={baseScoreDashSpec.strokeDashPathPattern.id}
            label="Base Stroke Dash Pattern"
            setter={(id) => {
              setBaseScoreDashSpecPattern(id);
            }}
            options={dashPatternOptions}
          />
          <PanelSlider
            valuePath="pyramidNetSpec.baseScoreDashSpec.strokeDashLength"
            label="Base Stroke Dash Length"
            value={baseScoreDashSpec.strokeDashLength}
            setter={(val) => {
              baseScoreDashSpec.strokeDashLength = val;
            }}
            {...strokeLengthProps}
          />
          <PanelSlider
            valuePath="pyramidNetSpec.baseScoreDashSpec.strokeDashOffsetRatio"
            label="Base Stroke Dash Offset Ratio"
            value={baseScoreDashSpec.strokeDashOffsetRatio}
            setter={(val) => {
              baseScoreDashSpec.strokeDashOffsetRatio = val;
            }}
            {...ratioSliderProps}
          />
        </>
      )}
    </>
  );
});
// } {
// } {
// }]
//   // @ts-ignore
//   .map(ControlElement);
