import { startCase, last } from 'lodash';
import uuid from 'uuid/v1';
import React from 'react';
import {
  Tooltip, Typography, Slider, FormControl,
} from '@material-ui/core';

import { useStyles } from '../../DielineViewer/style';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

const ValueLabelComponent = ({ children, open, value }) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

// TODO: fix value label cut off and wrong color
// convert to slider with text input? could allow escaping bounds
export const PanelSlider = ({
  value, onChange, onChangeCommitted, valuePath,
  min, max, step, label = undefined, valueLabelFormat = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const elementLabel = label || getLabelFromValuePath(valuePath);
  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {elementLabel}
      </Typography>
      <Slider
        name={valuePath}
        value={value}
        aria-labelledby={labelId}
        valueLabelDisplay="auto"
        ValueLabelComponent={ValueLabelComponent}
        valueLabelFormat={
          valueLabelFormat || ((val) => val && val.toFixed(2))
        }
        {...{
          onChange, onChangeCommitted, min, max, step,
        }}
      />
    </FormControl>
  );
};
