import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { useStyles } from '../style/style';
import { ControllablePrimitiveWithOptionsModel } from '../keystone-tweakables/models/ControllablePrimitiveWithOptionsModel';
import { ControllableReferenceWithOptionsModel } from '../keystone-tweakables/models/ControllableReferenceWithOptionsModel';

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

export const NodeReferenceSelect = observer(({
  node,
}: { node: ControllableReferenceWithOptionsModel<any, any> }) => {
  const { valuePath, label, options } = node;

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
        label,
        name: valuePath,
      }}
    />
  );
});

export const NodeSelect = observer(({
  node,
}: { node: ControllablePrimitiveWithOptionsModel<any, any> }) => {
  const {
    valuePath, label, options,
  } = node;

  return (
    <UncontrolledNodeSelect
      {...{
        onChange: (e) => {
          node.setValue(e.target.value);
        },
        options,
        value: node.value,
        label,
        name: valuePath,
      }}
    />
  );
});
