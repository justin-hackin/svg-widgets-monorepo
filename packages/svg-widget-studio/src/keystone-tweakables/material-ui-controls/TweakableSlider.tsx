import { Typography } from '@mui/material';
import React from 'react';
import { v1 as uuid } from 'uuid';

import { observer } from 'mobx-react';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { INPUT_TYPE, SliderMetadata } from '../types';
import { TweakableUnlabelledSlider } from './TweakableUnlabelledSlider';
import { FormControlStyled } from '../../style';

export const TweakableSlider = observer(({
  node, className,
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
