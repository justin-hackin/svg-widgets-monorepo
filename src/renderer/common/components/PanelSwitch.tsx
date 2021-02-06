import React from 'react';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { Switch } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useStyles } from '../../DielineViewer/style';
import { mstDataToProps } from '../util/mst';

export const PanelSwitchUncontrolled = observer(({
  value, valuePath, onChange, label,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  if (value === undefined) { return null; }

  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {label}
      </Typography>
      <Switch
        value={value}
        name={valuePath}
        aria-labelledby={labelId}
        color="primary"
        onChange={onChange}
      />
    </FormControl>
  );
});

export const PanelSwitch = ({ node, property, label = undefined }) => {
  const {
    value, setValue, label: resolvedLabel, valuePath,
  } = mstDataToProps(node, property, label);
  if (value === undefined) { return null; }
  return (
    <PanelSwitchUncontrolled
      value={value}
      label={resolvedLabel}
      valuePath={valuePath}
      onChange={(e) => {
        setValue(e.target.checked);
      }}
    />
  );
};
