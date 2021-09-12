import React from 'react';
import uuid from 'uuid/v1';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { NodeUnlabelledNumberTextInput } from './NodeUnlabelledNumberTextInput';
import { useStyles } from '../style/style';
import { ControllablePrimitiveModel, NumberTextMetadata, SliderWithTextMetadata } from '../util/controllable-property';

export const NodeNumberTextInput = observer((
  { node }: { node: ControllablePrimitiveModel<number, NumberTextMetadata | SliderWithTextMetadata> },
) => {
  const classes = useStyles();
  const labelId = uuid();
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <NodeUnlabelledNumberTextInput
        node={node}
        labelId={labelId}
      />
    </div>
  );
});
