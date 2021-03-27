import React from 'react';
import uuid from 'uuid/v1';
import { startCase } from 'lodash';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { ChromePicker } from 'react-color';

import { useStyles } from '../../renderer/DielineViewer/style';
import { mstDataToProps } from '../util/mst';

export const PanelColorPicker = ({
  node, property, label = undefined, ...rest
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const { value, setValue } = mstDataToProps(node, property);
  const resolvedLabel = `${label || startCase(property)}`;
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
