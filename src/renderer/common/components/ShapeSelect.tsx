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
import { observer } from 'mobx-react';

import { useStyles } from '../../DielineViewer/style';
import { polyhedra } from '../../DielineViewer/data/polyhedra';
import requireStatic from '../../requireStatic';

export const ShapeSelect = observer(({
  onChange, value, name, displayEmpty = undefined, className = undefined,
}) => {
  const label = 'Polyhedron';
  const classes = useStyles();
  const labelId = `${label}__${uuid()}`;
  const selectProps = {
    labelId,
    value,
    name,
    displayEmpty,
    onChange,
  };
  return (
    <FormControl className={`${className} ${classes.formControl}`}>
      <InputLabel id={labelId}>{ label }</InputLabel>
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
});
