import { Input } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';

import { styled } from '@mui/styles';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { useWorkspaceMst } from '../rootStore';
import {
  getFractionOrNull, PIXELS_PER_UNIT, pxToUnitView, UNITS,
} from '../helpers/units';
import { NumberTextMetadata, SliderWithTextMetadata } from '../types';

enum INPUT_STATUS {
  SAVED = 'saved', DIRTY = 'dirty', ERROR = 'error',
}

const getStatusClass = (status: INPUT_STATUS) => `input_status--${status}`;

const StyledInput = styled(Input)(({ theme }) => ({
  '&:after': {
    transition: 'border-bottom-color 0.25s cubic',
  },
  [`&.${getStatusClass(INPUT_STATUS.ERROR)}:after`]: {
    borderBottomColor: theme.palette.error.main,
  },
  [`&.${getStatusClass(INPUT_STATUS.DIRTY)}:after`]: {
    borderBottomColor: theme.palette.warning.main,
  },
}));

export const TweakableUnlabelledNumberTextInput = observer(({
  node, labelId,
}: { node: TweakablePrimitiveModel<number, (NumberTextMetadata | SliderWithTextMetadata)>, labelId: string }) => {
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const [
    inputStatus, setInputStatus,
  ] = useState<INPUT_STATUS>(INPUT_STATUS.SAVED);

  const { value, valuePath, metadata: { useUnits } } = node;

  const [inputValue, setInputValue] = useState<string>(
    useUnits ? pxToUnitView(value, displayUnit) : `${value}`,
  );

  useEffect(() => {
    setInputValue(useUnits ? pxToUnitView(value, displayUnit) : `${value}`);
  }, [displayUnit, useUnits]);

  return (
    <StyledInput
      className={getStatusClass(inputStatus)}
      value={inputValue}
      name={valuePath}
      onChange={(e) => {
        setInputValue(e.target.value);
        setInputStatus(INPUT_STATUS.DIRTY);
      }}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let newPxValue;
          if (!useUnits || displayUnit === UNITS.cm) {
            // is not in fractional form
            const parsedValue = parseFloat(inputValue);
            if (!Number.isFinite(parsedValue)) {
              setInputStatus(INPUT_STATUS.ERROR);
              return;
            }
            newPxValue = parsedValue * PIXELS_PER_UNIT[displayUnit];
            node.setValue(newPxValue);
          } else {
            // displayUnit is inches
            const maybeFraction = getFractionOrNull(inputValue);
            if (maybeFraction === null) {
              setInputStatus(INPUT_STATUS.ERROR);
              return;
            }
            const [num, denom] = maybeFraction;
            newPxValue = (num / denom) * PIXELS_PER_UNIT[displayUnit];
            node.setValue(newPxValue);
          }
          if (useUnits) {
            // the fraction is parsed twice
            setInputValue(pxToUnitView(newPxValue, displayUnit));
          }
          setInputStatus(INPUT_STATUS.SAVED);
        }
      }}
      inputProps={{ 'aria-label': labelId }}
    />
  );
});
