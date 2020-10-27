import React from 'react';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { Switch } from '@material-ui/core';

import { useStyles } from '../../DielineViewer/style';

export const PanelSwitch = ({
  label, setter, value = undefined, defaultValue = undefined, valuePath, ...rest
}) => {
  const classes = useStyles();
  const labelId = uuid();
  if (value === undefined && defaultValue === undefined) { return null; }

  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>
      <Switch
        {...(defaultValue ? { value: defaultValue } : { checked: value })}
        name={valuePath}
        aria-labelledby={labelId}
        // @ts-ignore
        onChange={(e:any) => {
          setter(e.target.checked);
        }}
        {...rest}
      />
    </FormControl>
  );
};
