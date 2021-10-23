import { observer } from 'mobx-react';
import {
  FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@mui/material';
import React from 'react';
import { FormControlStyled } from '../../style/style';

export const SimpleRadio = observer(({
  value, onChange, options, label, name, row = false,
}) => (
  <FormControlStyled>
    <FormLabel component="legend">{label}</FormLabel>
    <RadioGroup
      {...{
        name,
        value,
        onChange,
      }}
      row={row}
    >
      {options.map(({
        label: optionLabel,
        value: optionValue,
      }) => (
        <FormControlLabel key={optionValue} value={optionValue} control={<Radio />} label={optionLabel} />
      ))}
    </RadioGroup>
  </FormControlStyled>
));
