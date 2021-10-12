import { observer } from 'mobx-react';
import uuid from 'uuid/v1';
import Typography from '@mui/material/Typography';
import { Switch } from '@mui/material';
import React from 'react';
import { MyFormControl } from '../../style/style';

export const SimpleSwitch = observer(({
  value,
  name,
  onChange,
  label,
}) => {
  const labelId = uuid();
  if (value === undefined) {
    return null;
  }

  return (
    <MyFormControl>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>
      <Switch
        checked={value}
        name={name}
        aria-labelledby={labelId}
        onChange={onChange}
      />
    </MyFormControl>
  );
});
