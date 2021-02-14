import React from 'react';
import uuid from 'uuid/v1';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';

// TODO: get unit from preferences by default, prop overrides
// used to present underlying pixel values as unit-specific conversions
// TODO: round up/down max/min/step based on unit (so that all values are divisible by the step)
import { SubmittableTextInput } from './SubmittableTextInput';
import { mstDataToProps } from '../util/mst';
import { useStyles } from '../../DielineViewer/style';

export const PanelTextInput = observer(({
  node, property, useUnits= false, label = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const {
    value, setValue, label: resolvedLabel, valuePath,
  } = mstDataToProps(node, property, label, useUnits);
  return (
    <div className={classes.formControl}>
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
    </div>
  );
});
