import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import { useStyles } from '../../die-line-viewer/components/SVGViewer/style';

export const PanelSelect = ({
  label, options, displayEmpty, setter, value, className,
}) => {
  // @ts-ignore
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;
  const selectProps = {
    labelId,
    value,
    displayEmpty,
    onChange: (e) => {
      setter(e.target.value);
    },
  };
  return (
    <FormControl className={`${classes.formControl} ${className}`}>
      <InputLabel id={labelId}>{ label }</InputLabel>
      <Select {...selectProps}>
        {options.map(({ label: optionLabel, value: optionValue }, i) => (
          <MenuItem key={i} value={optionValue}>{optionLabel}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
