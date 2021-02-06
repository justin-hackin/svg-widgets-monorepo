import React from 'react';
import uuid from 'uuid/v1';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

// TODO: get unit from preferences by default, prop overrides
// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { SubmittableTextInput } from './SubmittableTextInput';
import { mstDataToProps } from '../util/mst';

export const PanelTextInput = observer(({
  node, property, label,
}) => {
  const labelId = uuid();
  const {
    value, setValue, label: resolvedLabel, valuePath, useUnits,
  } = mstDataToProps(node, property, label);
  return (
    <>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>
      <SubmittableTextInput
        useUnits={useUnits}
        value={value}
        setValue={setValue}
        valuePath={valuePath}
        labelId={labelId}
      />
    </>
  );
});
