import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { useStyles } from '../../DielineViewer/style';
import { getLabelFromValuePath } from './PanelSlider';

export const PanelSelect = ({
  options, onChange, value, valuePath, displayEmpty = undefined, label = undefined, className = '',
}) => {
  const displayedLabel = label || getLabelFromValuePath(valuePath);
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;
  const selectProps = {
    labelId,
    value,
    name: valuePath,
    displayEmpty,
    onChange,
  };
  return (
    <FormControl className={`${classes.formControl} ${className}`}>
      <InputLabel id={labelId}>{ displayedLabel }</InputLabel>
      <Select {...selectProps}>
        {options.map(({ label: optionLabel, value: optionValue }, i) => (
          <MenuItem key={i} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
