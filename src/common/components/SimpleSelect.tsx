import { observer } from 'mobx-react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import uuid from 'uuid/v1';
import { useStyles } from '../style/style';

export const SimpleSelect = observer(({
  value,
  onChange,
  options,
  label,
  name,
  displayEmpty = undefined,
}) => {
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;

  if (value === undefined) {
    return null;
  }
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select {...{
        labelId,
        value,
        name,
        displayEmpty,
        onChange,
      }}
      >
        {options.map(({
          label: optionLabel,
          value: optionValue,
        }) => (
          <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
