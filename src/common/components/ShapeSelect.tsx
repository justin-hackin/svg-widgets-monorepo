import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import {
  Avatar, ListItemAvatar, Typography,
} from '@material-ui/core';
import { startCase, sortBy } from 'lodash';
import { observer } from 'mobx-react';
import clsx from 'clsx';

import { useStyles } from '../style/style';
import { polyhedra } from '../../renderer/DielineViewer/data/polyhedra';
import requireStatic from '../../renderer/requireStatic';

export const ShapeSelect = observer(({
  onChange, value, name, displayEmpty = undefined, className = undefined, isCompactDisplay = false,
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
  const classNames = clsx(
    className, classes.shapeSelect, classes.formControl, isCompactDisplay && classes.compactShapeSelect,
  );
  return (
    <FormControl className={classNames}>
      { !isCompactDisplay && <InputLabel id={labelId}>{ label }</InputLabel>}
      <Select
        {...selectProps}
        SelectDisplayProps={{
          className: clsx(classes.shapeSelectDisplay, isCompactDisplay && classes.compactShapeSelect),
        }}
      >
        {sortBy(Object.keys(polyhedra)).map((shapeName, i) => (
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
