import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import uuid from 'uuid/v1';
import FormControl from '@material-ui/core/FormControl';
import React from 'react';
import {
  Avatar, ListItemAvatar, Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import clsx from 'clsx';

import { useStyles } from '../style/style';
import requireStatic from '../../renderer/requireStatic';
import { ControllablePrimitiveModel, SelectMetadata } from '../util/controllable-property';

export const ShapeSelect = observer(({
  node, className = undefined, isCompactDisplay = false,
}: {
  node: ControllablePrimitiveModel<string, SelectMetadata<any>>, className?: string, isCompactDisplay?: boolean
}) => {
  const classes = useStyles();
  const labelId = `${node.label}__${uuid()}`;
  const classNames = clsx(
    className, classes.shapeSelect, classes.formControl, isCompactDisplay && classes.compactShapeSelect,
  );
  return (
    <FormControl className={classNames}>
      { !isCompactDisplay && <InputLabel id={labelId}>{ node.label }</InputLabel>}
      <Select
        {...{
          labelId,
          onChange: (e) => { node.setValue(e.target.value as string); },
          value: node.value,
          name: node.valuePath,
        }}
        SelectDisplayProps={{
          className: clsx(classes.shapeSelectDisplay, isCompactDisplay && classes.compactShapeSelect),
        }}
      >
        {node.metadata.options.map(({ value, label }, i) => (
          <MenuItem key={i} value={value}>
            {/* preview images generated with https://codesandbox.io/s/youthful-joliot-uxiy */}
            <ListItemAvatar>
              <Avatar
                alt={label}
                className={classes.shapeAvatar}
                src={
                  requireStatic(`images/model-previews/${value}.png`)
                }
              />
            </ListItemAvatar>
            <Typography variant="inherit" className={classes.shapeName}>{label}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
