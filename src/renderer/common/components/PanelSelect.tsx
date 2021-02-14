import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { observer } from 'mobx-react';

import { startCase } from 'lodash';
import { useStyles } from '../../DielineViewer/style';
import { mstDataToProps } from '../util/mst';

export const UncontrolledPanelSelect = observer(({
  value, onChange, options, label, name, displayEmpty = undefined,
}) => {
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;
  const selectProps = {
    labelId,
    value,
    name,
    displayEmpty,
    onChange,
  };
  if (value === undefined) { return null; }
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={labelId}>{ label }</InputLabel>
      <Select {...selectProps}>
        {options.map(({ label: optionLabel, value: optionValue }, i) => (
          <MenuItem key={i} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

export const PanelSelect = observer(({
  node, property, options, label,
}) => {
  const {
    value, setValue, valuePath,
  } = mstDataToProps(node, property);
  const resolvedLabel = label || startCase(property);
  const onChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <UncontrolledPanelSelect
      {...{
        onChange, options, value, label: resolvedLabel, name: valuePath,
      }}
    />
  );
});
