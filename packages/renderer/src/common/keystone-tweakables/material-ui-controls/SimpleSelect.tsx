import { observer } from 'mobx-react';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import uuid from 'uuid/v1';
import { MyFormControl } from '../../style/style';

export const SimpleSelect = observer(({
  value,
  onChange,
  options,
  label,
  name,
  displayEmpty = undefined,
}) => {
  const labelId = `${label}__${uuid()}`;

  if (value === undefined) {
    return null;
  }
  return (
    <MyFormControl>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select {...{
        labelId,
        value,
        name,
        displayEmpty,
        onChange,
        label,
      }}
      >
        {options.map(({
          label: optionLabel,
          value: optionValue,
        }) => (
          <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </MyFormControl>
  );
});
