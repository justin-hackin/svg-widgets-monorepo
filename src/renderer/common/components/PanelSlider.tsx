import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { useStyles } from '../../die-line-viewer/components/SVGViewer/style';

export const PanelSlider = ({
  label, setter, value, valuePath, ...rest
}) => {
  // @ts-ignore
  const classes = useStyles();
  const labelId = uuid();
  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>
      {/* @ts-ignore */}
      <Slider
        name={valuePath}
        value={value}
        aria-labelledby={labelId}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => val && val.toFixed(2)}
        onChange={(e:any, val:number) => {
          setter(val);
        }}
        {...rest}
      />
    </FormControl>
  );
};
