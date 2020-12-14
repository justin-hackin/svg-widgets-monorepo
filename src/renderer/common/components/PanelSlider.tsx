import { startCase, last } from 'lodash';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import { useStyles } from '../../DielineViewer/style';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

export const PanelSlider = ({
  value, onChange, onChangeCommitted, valuePath, label = undefined, ...rest
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
        valueLabelFormat={(val) => val && val.toFixed(2)}
        {...{ onChange, onChangeCommitted }}
        {...rest}
      />
    </FormControl>
  );
};
