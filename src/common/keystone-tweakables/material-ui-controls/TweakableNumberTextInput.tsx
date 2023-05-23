import React from 'react';
import uuid from 'uuid/v1';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';

// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { FormControlStyled } from '../../style/style';
import { TweakableUnlabelledNumberTextInput } from './TweakableUnlabelledNumberTextInput';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { NumberTextMetadata, SliderWithTextMetadata } from '../types';

export const TweakableNumberTextInput = observer((
  { node, className }: {
    className?: string, node: TweakablePrimitiveModel<number, NumberTextMetadata | SliderWithTextMetadata>
  },
) => {
  const labelId = uuid();
  return (
    <FormControlStyled className={className}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <TweakableUnlabelledNumberTextInput
        node={node}
        labelId={labelId}
      />
    </FormControlStyled>
  );
});
