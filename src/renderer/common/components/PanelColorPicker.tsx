import uuid from 'uuid/v1';
import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { ChromePicker } from 'react-color';
import { useStyles } from '../../DielineViewer/style';
import { mstDataToProps } from '../util/mst';

export const PanelColorPicker = ({
  node, property, label = undefined, ...rest
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const {
    value, setValue, label: resolvedLabel,
  } = mstDataToProps(node, property, label);
  if (value === undefined) { return null; }
  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>

      <ChromePicker
        className={classes.panelChromePicker}
        name={labelId}
        color={value}
        onChangeComplete={(color) => {
          setValue(color.hex);
        }}
        {...rest}
      />
    </FormControl>
  );
};
