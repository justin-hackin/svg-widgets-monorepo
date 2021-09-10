import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React, { useMemo } from 'react';
import { observer } from 'mobx-react';

import { startCase } from 'lodash';
import { useStyles } from '../style/style';
import { ControllableSelectReferenceModel } from '../util/controllable-property';

export const UncontrolledNodeSelect = observer(({
  value, onChange, options, label, name, displayEmpty = undefined,
}) => {
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;

  if (value === undefined) { return null; }
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={labelId}>{ label }</InputLabel>
      <Select {...{
        labelId,
        value,
        name,
        displayEmpty,
        onChange,
      }}
      >
        {options.map(({ label: optionLabel, value: optionValue }) => (
          <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

export const NodeSelect = observer(({
  node,
}: { node: ControllableSelectReferenceModel<any, any> }) => {
  const {
    valuePath, label, ownPropertyName, options,
  } = node;

  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.value.$modelId] = option;
    return acc;
  }, {}), [options]);

  return (
    <UncontrolledNodeSelect
      {...{
        onChange: (e) => {
          node.setValue(idToOptions[e.target.value].value);
        },
        options: options.map(({ label: optionLabel, value: { $modelId } }) => ({
          value: $modelId, label: optionLabel,
        })),
        value: node.value.$modelId,
        label: label || startCase(ownPropertyName),
        name: valuePath,
      }}
    />
  );
});
