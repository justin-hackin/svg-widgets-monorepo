import { Typography } from '@material-ui/core';
import React from 'react';
import uuid from 'uuid/v1';

import { observer } from 'mobx-react';
import { useStyles } from './style/style';
import { TweakablePrimitiveModel } from './keystone-tweakables/models/TweakablePrimitiveModel';
import { INPUT_TYPE, SliderMetadata } from './keystone-tweakables/types';
import { TweakableUnlabelledSlider } from './TweakableUnlabelledSlider';

export const TweakableSlider = observer(({
  node, className = undefined,
}: { node: TweakablePrimitiveModel<number, SliderMetadata>, className?: string, useUnits?: boolean }) => {
  const classes = useStyles();
  const labelId = uuid();

  // @ts-ignore
  if (node.metadata.type !== INPUT_TYPE.SLIDER) {
    throw new Error(`Slider node must have metadata.type as "slider", saw: ${node.metadata.type}`);
  }
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <TweakableUnlabelledSlider
        className={className}
        node={node}
        labelId={labelId}
      />
    </div>
  );
});
