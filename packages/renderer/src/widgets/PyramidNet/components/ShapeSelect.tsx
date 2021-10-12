import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import uuid from 'uuid/v1';
import React from 'react';
import { Avatar, ListItemAvatar, ListItemText } from '@mui/material';
import { observer } from 'mobx-react';

import { styled } from '@mui/styles';
import { TweakablePrimitiveWithOptionsModel }
  from '../../../common/keystone-tweakables/models/TweakablePrimitiveWithOptionsModel';
import { WithOptionsMetadata } from '../../../common/keystone-tweakables/types';
import { MyFormControl } from '../../../common/style/style';

const classes = {
  shapeSelectDisplay: 'shape-select-display',
  shapeName: 'shape-select-shape-name',
  shapeAvatar: 'shape-select-shape-avatar',
  isCompact: 'shape-select-display--compact',
};

const ShapeSelectFormControl = styled(MyFormControl)(({ theme }) => ({
  marginTop: theme.spacing(1),
  [`& .${classes.shapeAvatar}`]: {
    width: '128px',
    height: '128px',
  },
  [`& .${classes.shapeSelectDisplay}`]: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: 0,
  },
  [`&.${classes.isCompact}`]: {
    width: '80px',
    [`& .${classes.shapeSelectDisplay}`]: {
      paddingRight: theme.spacing(1),
      [`& .${classes.shapeName}`]: {
        display: 'none',
      },
      [`& .${classes.shapeAvatar}`]: {
        width: '50px',
        height: '50px',
      },
    },
  },
}));

export const ShapeSelect = observer(({
  node, className = undefined, isCompactDisplay = false,
}: {
  node: TweakablePrimitiveWithOptionsModel<string, WithOptionsMetadata<any>>,
  className?: string, isCompactDisplay?: boolean
}) => {
  const labelId = `${node.label}__${uuid()}`;

  return (
    <ShapeSelectFormControl className={`${isCompactDisplay ? classes.isCompact : ''} ${className}`}>
      { !isCompactDisplay && <InputLabel id={labelId}>{ node.label }</InputLabel>}
      <Select
        {...{
          labelId,
          onChange: (e) => { node.setValue(e.target.value as string); },
          value: node.value,
          name: node.valuePath,
        }}
        label={isCompactDisplay ? undefined : node.label}
        SelectDisplayProps={{
          className: classes.shapeSelectDisplay,
        }}
      >
        {node.options.map(({ value, label }, i) => (
          <MenuItem key={i} value={value}>
            {/* preview images generated with https://codesandbox.io/s/youthful-joliot-uxiy */}
            <ListItemAvatar>
              <Avatar
                alt={label}
                className={classes.shapeAvatar}
                src={new URL(`../../../../static/images/model-previews/${value}.png`, import.meta.url).href}
              />
            </ListItemAvatar>
            <ListItemText className={classes.shapeName} primary={label} />
          </MenuItem>
        ))}
      </Select>
    </ShapeSelectFormControl>
  );
});
