import React from 'react';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { Switch } from '@material-ui/core';
import { observer } from 'mobx-react';

import { useStyles } from '../style/style';
import { ControllablePrimitiveModel, SwitchMetadata } from '../util/controllable-property';

export const NodeSwitchUncontrolled = observer(({
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
        checked={value}
        name={valuePath}
        aria-labelledby={labelId}
        color="primary"
        onChange={onChange}
      />
    </FormControl>
  );
});

export const NodeSwitch = observer((
  { node } : { node: ControllablePrimitiveModel<boolean, SwitchMetadata> },
) => {
  if (node.value === undefined) { return null; }
  return (
    <NodeSwitchUncontrolled
      value={node.value}
      label={node.label}
      valuePath={node.valuePath}
      onChange={(e) => {
        node.setValue(e.target.checked);
      }}
    />
  );
});
