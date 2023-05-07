import { Typography } from '@mui/material';
import React from 'react';
import uuid from 'uuid/v1';

import { observer } from 'mobx-react';
import { FormControlStyled } from '../../style/style';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { INPUT_TYPE, SliderMetadata } from '../types';
import { TweakableUnlabelledSlider } from './TweakableUnlabelledSlider';

export const TweakableSlider = observer(({
  node, className = undefined,
}: { node: TweakablePrimitiveModel<number, SliderMetadata>, className?: string, useUnits?: boolean }) => {
  const labelId = uuid();

  if (node.metadata.type !== INPUT_TYPE.SLIDER) {
    throw new Error(`Slider node must have metadata.type as "slider", saw: ${node.metadata.type}`);
  }
  return (
    <FormControlStyled>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <TweakableUnlabelledSlider
        className={className}
        node={node}
        labelId={labelId}
      />
    </FormControlStyled>
  );
});
