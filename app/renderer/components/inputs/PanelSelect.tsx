import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { useStyles } from '../style';

export const PanelSelect = ({
  label, options, setter, value,
}) => {
  // @ts-ignore
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={labelId}>{ label }</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        onChange={(e) => {
          setter(e.target.value);
        }}
      >
        {options.map(({ label: optionLabel, value: optionValue }, i) => (
          <MenuItem key={i} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
