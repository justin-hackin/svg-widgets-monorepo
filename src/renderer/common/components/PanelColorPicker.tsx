import uuid from 'uuid/v1';
import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { ChromePicker } from 'react-color';
import { useStyles } from '../../DielineViewer/style';

export const PanelColorPicker = ({
  label, onChangeComplete, value, valuePath, ...rest
}) => {
  const classes = useStyles();
  const labelId = uuid();
  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>

      <ChromePicker
        className={classes.panelChromePicker}
        name={labelId}
        color={value}
        onChangeComplete={onChangeComplete}
        {...rest}
      />
    </FormControl>
  );
};
