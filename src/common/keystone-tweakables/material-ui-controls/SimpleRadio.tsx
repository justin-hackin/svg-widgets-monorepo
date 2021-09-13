import { observer } from 'mobx-react';
import FormControl from '@material-ui/core/FormControl';
import {
  FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@material-ui/core';
import React from 'react';
import { useStyles } from '../../style/style';

export const SimpleRadio = observer(({
  value, onChange, options, label, name, row = false,
}) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
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
    </FormControl>
  );
});
