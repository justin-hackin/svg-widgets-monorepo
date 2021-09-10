import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { observer } from 'mobx-react';
import {
  FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@material-ui/core';

import { useStyles } from '../style/style';
import { ControllablePrimitiveModel, RadioMetadata } from '../util/controllable-property';

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
  { node }: { node: ControllablePrimitiveModel<any, RadioMetadata<any>> },
) => (
  <UncontrolledNodeRadio
    {...{
      onChange: (e) => {
        node.setValue(e.target.value);
      },
      options: node.metadata.options,
      row: node.metadata.isRow,
      value: node.value,
      label: node.label,
      name: node.valuePath,
    }}
  />
));
