import React from 'react';
import uuid from 'uuid/v1';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { TweakableUnlabelledNumberTextInput } from './TweakableUnlabelledNumberTextInput';
import { useStyles } from '../../style/style';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { NumberTextMetadata, SliderWithTextMetadata } from '../types';

export const TweakableNumberTextInput = observer((
  { node }: { node: TweakablePrimitiveModel<number, NumberTextMetadata | SliderWithTextMetadata> },
) => {
  const classes = useStyles();
  const labelId = uuid();
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <TweakableUnlabelledNumberTextInput
        node={node}
        labelId={labelId}
      />
    </div>
  );
});
