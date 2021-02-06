import { Input } from '@material-ui/core';
import React from 'react';
import parseFraction from 'parse-fraction';

import { CURRENT_UNIT, pxToUnitView, UNIT_TO_PIXELS } from '../util/geom';

export const SubmittableTextInput = ({
  value,
  setValue,
  valuePath,
  labelId,
  useUnits = false,
}) => (
  <Input
    defaultValue={useUnits ? pxToUnitView(value) : value}
    name={valuePath}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        const stringValue = (e.target as HTMLInputElement).value;
        if (useUnits) {
          try {
            const [num, denom] = parseFraction(stringValue);
            setValue((num / denom) * UNIT_TO_PIXELS[CURRENT_UNIT]);
            // eslint-disable-next-line no-empty
          } catch (_) { }
        } else {
          const parsedFloat = parseFloat(stringValue);
          if (!Number.isNaN(parsedFloat)) {
            setValue(parsedFloat);
          }
        }
      }
    }}
    inputProps={{ 'aria-label': labelId }}
  />
);
