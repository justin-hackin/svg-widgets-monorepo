import FormControl from '@material-ui/core/FormControl';
import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@material-ui/core';

import { useStyles } from '../style/style';
import {
  ControllablePrimitiveWithOptionsModel, ControllableReferenceWithOptionsModel,
  RadioMetadata,
  ReferenceRadioMetadata,
} from '../util/controllable-property';

export const UncontrolledNodeRadio = observer(({
  value, onChange, options, label, name, row = false,
}) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.formControl}>
      <FormLabel component="legend">{ label }</FormLabel>
      <RadioGroup {...{ name, value, onChange }} row={row}>
        {options.map(({ label: optionLabel, value: optionValue }) => (
          <FormControlLabel key={optionValue} value={optionValue} control={<Radio />} label={optionLabel} />
        ))}
      </RadioGroup>
    </FormControl>
  );
});

export const NodeRadio = observer((
  { node }: { node: ControllablePrimitiveWithOptionsModel<any, RadioMetadata<any>> },
) => (
  <UncontrolledNodeRadio
    {...{
      onChange: (e) => {
        node.setValue(e.target.value);
      },
      options: node.options,
      row: node.metadata.isRow,
      value: node.value,
      label: node.label,
      name: node.valuePath,
    }}
  />
));

// NOTE: not used but useful for future "framework" library
export const NodeReferenceRadio = observer((
  { node }: { node: ControllableReferenceWithOptionsModel<any, ReferenceRadioMetadata<any>> },
) => {
  const { valuePath, label, options } = node;
  const idToOptions = useMemo(() => options.reduce((acc, option) => {
    acc[option.value.$modelId] = option;
    return acc;
  }, {}), [options]);

  return (
    <UncontrolledNodeRadio
      {...{
        onChange: (e) => {
          node.setValue(idToOptions[e.target.value].value);
        },
        options,
        row: node.metadata.isRow,
        value: node.value.$modelId,
        label,
        name: valuePath,
      }}
    />
  );
});
