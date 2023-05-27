import { observer } from 'mobx-react';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { v1 as uuid } from 'uuid';
import { FormControlStyled } from '../../style';

export const SimpleSelect = observer(({
  value,
  onChange,
  options,
  label,
  name,
  displayEmpty = undefined,
}) => {
  const labelId = `${label}__${uuid()}`;

  return (
    <FormControlStyled>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select {...{
        labelId,
        value: value || '',
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
    </FormControlStyled>
  );
});
