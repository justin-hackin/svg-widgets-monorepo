import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { observer } from 'mobx-react';

import {
  FormControlLabel, FormLabel, Radio, RadioGroup,
} from '@material-ui/core';
import { startCase } from 'lodash';
import { useStyles } from '../style/style';
import { mstDataToProps } from '../util/mobx-keystone';

export const UncontrolledPanelRadio = observer(({
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

export const PanelRadio = observer(({
  node, property, options, row = false, label = undefined,
}) => {
  const {
    value, setValue, valuePath,
  } = mstDataToProps(node, property);
  const resolvedLabel = `${label || startCase(property)}`;

  const onChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <UncontrolledPanelRadio
      {...{
        onChange, options, row, value, label: resolvedLabel, name: valuePath,
      }}
    />
  );
});
