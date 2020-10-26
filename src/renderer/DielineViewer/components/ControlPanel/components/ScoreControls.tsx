import React from 'react';

import { VERY_SMALL_NUMBER } from '../../../../common/util/geom';
import { PanelSelect } from '../../../../common/components/PanelSelect';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { MIRRORED_STROKES } from '../../../config';
import { ControlElement } from './ControlElement';
import { dashPatterns } from '../../../data/dash-patterns';
import { ratioSliderProps } from './constants';

const strokeLengthProps = { min: 1, max: 3000, step: VERY_SMALL_NUMBER };
const dashPatternOptions = Object.entries(dashPatterns).map(([key, { label }]) => ({ value: key, label }));
export const ScoreControls = () => (
  <>
    <ControlElement
      component={PanelSelect}
      valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashPathPatternId"
      label="Inter-face Stroke Pattern"
      options={dashPatternOptions}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashLength"
      label="Inter-face Stroke Dash Length"
      {...strokeLengthProps}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashOffsetRatio"
      label="Inter-face Stroke Dash Offset Ratio"
      disabled={!MIRRORED_STROKES}
      {...ratioSliderProps}
    />
    <ControlElement
      component={PanelSelect}
      valuePath="pyramidNetSpec.baseScoreDashSpec.strokeDashPathPatternId"
      label="Base Stroke Pattern"
      options={dashPatternOptions}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.baseScoreDashSpec.strokeDashLength"
      label="Base Stroke Dash Length"
      {...strokeLengthProps}
    />
    <ControlElement
      component={PanelSlider}
      valuePath="pyramidNetSpec.baseScoreDashSpec.strokeDashOffsetRatio"
      label="Base Stroke Dash Offset Ratio"
      disabled={!MIRRORED_STROKES}
      {...ratioSliderProps}
    />
  </>
);
// } {
// } {
// }]
//   // @ts-ignore
//   .map(ControlElement);
