import uuid from 'uuid/v1';
import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { ChromePicker } from 'react-color';
import { useStyles } from '../../die-line-viewer/components/SVGViewer/style';

const { useState } = React;

export const PanelColorPicker = ({
  label, setter, value, valuePath, ...rest
}) => {
  // @ts-ignore
  const classes = useStyles();
  const labelId = uuid();
  const [isPickerShown, setPickerShown] = useState(false);
  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>

      <Paper
        style={{ backgroundColor: value }}
        className={classes.colorPickerInputPaper}
        onClick={() => {
          setPickerShown(!isPickerShown);
        }}
      >
        {isPickerShown ? (<KeyboardArrowUpIcon />) : (<KeyboardArrowDownIcon />)}
      </Paper>
      { isPickerShown && (
      <ChromePicker
        name={labelId}
        color={value}
        onChangeComplete={(color) => {
          setter(color.hex);
        }}
        {...rest}
      />
      )}

    </FormControl>
  );
};
