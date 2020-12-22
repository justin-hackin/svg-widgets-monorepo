import { startCase, last } from 'lodash';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { useStyles } from '../../DielineViewer/style';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

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
