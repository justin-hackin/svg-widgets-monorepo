import React from 'react';
import gcd from 'gcd';

import { PanelSlider } from './PanelSlider';

// TODO: get unit from preferences by default, prop overrides
// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import {
  CM_TO_PIXELS_RATIO, CURRENT_UNIT, INCHES_TO_PIXELS_RATIO, UNITS,
} from '../util/geom';

const IN_DENOMINATOR = 64;
const UNIT_STEP = {
  [UNITS.cm]: CM_TO_PIXELS_RATIO * 0.1,
  [UNITS.in]: (1.0 / IN_DENOMINATOR) * INCHES_TO_PIXELS_RATIO,
};

const UNIT_LABEL_FORMAT = {
  [UNITS.cm]: (val) => `${(val / CM_TO_PIXELS_RATIO).toFixed(2)}`,
  [UNITS.in]: (val) => {
    const valIn = val / INCHES_TO_PIXELS_RATIO;
    const abs = Math.floor(valIn);
    const remainder = valIn - abs;
    const numerator = Math.round(remainder * IN_DENOMINATOR);
    const gcdVal = gcd(numerator, IN_DENOMINATOR);
    const fractionStr = numerator ? `${numerator / gcdVal}/${IN_DENOMINATOR / gcdVal}` : '';
    return ` ${abs} ${fractionStr} `;
  },
};

export const PanelSliderUnitView = ({
  min, max, value, valuePath, onChange, label, onChangeCommitted,
}) => (
  <PanelSlider
    {...{
      min, max, value, valuePath, onChange, onChangeCommitted, label,
    }}
    step={UNIT_STEP[CURRENT_UNIT]}
    valueLabelFormat={UNIT_LABEL_FORMAT[CURRENT_UNIT]}
  />
);
