import { observer } from 'mobx-react';
import uuid from 'uuid/v1';

import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { Switch } from '@material-ui/core';
import React from 'react';
import { useStyles } from '../style/style';

export const SimpleSwitch = observer(({
  value,
  name,
  onChange,
  label,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  if (value === undefined) {
    return null;
  }

  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>
      <Switch
        checked={value}
        name={name}
        aria-labelledby={labelId}
        color="primary"
        onChange={onChange}
      />
    </FormControl>
  );
});
