import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import {
  Avatar, ListItemAvatar, Typography,
} from '@material-ui/core';
import { startCase } from 'lodash';

import { useStyles } from '../../DielineViewer/style';
import { getLabelFromValuePath } from './PanelSlider';
import { polyhedra } from '../../DielineViewer/data/polyhedra';
import requireStatic from '../../requireStatic';

export const ShapeSelect = ({
  onChange, value, valuePath, displayEmpty = undefined, label = undefined, className = '',
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
      <Select {...selectProps} SelectDisplayProps={{ className: classes.shapeSelectDisplay }}>
        {Object.keys(polyhedra).map((shapeName, i) => (
          <MenuItem key={i} value={shapeName}>
            {/* preview images generated with https://codesandbox.io/s/youthful-joliot-uxiy */}
            <ListItemAvatar>
              <Avatar
                alt={startCase(shapeName)}
                className={classes.shapeAvatar}
                src={
                  requireStatic(`images/model-previews/${shapeName}.png`)
                }
              />
            </ListItemAvatar>
            <Typography variant="inherit" className={classes.shapeName}>{startCase(shapeName)}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
