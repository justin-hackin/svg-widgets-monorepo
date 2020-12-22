import React from 'react';
import gcd from 'gcd';
import { PanelSlider } from './PanelSlider';

// TODO: get unit from preferences by default, prop overrides
// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { CM_TO_PIXELS_RATIO, INCHES_TO_PIXELS_RATIO } from '../util/geom';

export enum UNITS {
  cm, in,
}
const IN_DENOMINATOR = 64;
const UNIT_STEP = {
  [UNITS.cm]: CM_TO_PIXELS_RATIO * 0.1,
  [UNITS.in]: (1.0 / IN_DENOMINATOR) * INCHES_TO_PIXELS_RATIO,
};
const UNIT_LABEL_FORMAT = {
  [UNITS.cm]: (val) => `  ${(val / CM_TO_PIXELS_RATIO).toFixed(2)}cm  `,
  [UNITS.in]: (val) => {
    const abs = Math.abs(val);
    const remainder = val - abs;
    const numerator = Math.round(remainder * IN_DENOMINATOR);
    const gcdVal = gcd(numerator, IN_DENOMINATOR);
    const fractionStr = numerator ? `${numerator / gcdVal} / ${IN_DENOMINATOR / gcdVal}` : '';
    return `${abs} ${fractionStr}"`;
  },
};

export const PanelSliderUnitView = ({
  min, max, unit, value, valuePath, onChange, label, onChangeCommitted,
}) => (
  <PanelSlider
    {...{
      min, max, value, valuePath, onChange, onChangeCommitted, label,
    }}
    step={UNIT_STEP[unit]}
    valueLabelFormat={UNIT_LABEL_FORMAT[unit]}
  />
);
