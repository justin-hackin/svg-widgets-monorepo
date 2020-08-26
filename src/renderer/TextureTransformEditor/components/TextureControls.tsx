import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem,
} from '@material-ui/core';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';

import { PanelSelect } from '../../common/components/PanelSelect';
import { DragModeOptionsGroup } from './DragModeOptionGroup';

const NumberFormatDecimalDegrees = ({ inputRef, onChange, ...other }) => (
  <NumberFormat
    {...other}
    getInputRef={inputRef}
    onValueChange={(values) => {

      onChange({
        target: {
          name: other.name,
          floatValue: values.floatValue,
          value: values.value,
        },
      });
    }}
    decimalScale={1}
    suffix="°"
  />
);


export const TextureControls = ({
  classes, textureOptions, textureRotation, setTextureRotation,
  sendTexture, repositionOverCorner,
  isPositive, setIsPositive, fileIndex, setFileIndex, dragMode,
}) => {
  const [cornerSnapMenuAnchorEl, setCornerSnapMenuAnchorEl] = React.useState(null);
  const handleCornerSnapMenuClick = (event) => {
    setCornerSnapMenuAnchorEl(event.currentTarget);
  };


  const handleCornerSnapMenuClose = (index) => {
    if (index !== undefined) {
      repositionOverCorner(index);
    }
    setCornerSnapMenuAnchorEl(null);
  };

  return (
    <div className={classes.select}>
      <TextField
        className={classes.rotationInput}
        label="Rotation"
        value={textureRotation}
        onChange={({ target: { value } = {} }) => {
          // TODO: this should not run when value changes via props
          // TODO: once above is fixed, use textureRotationDragged
          if (isNumber(value) && !isNaN(value)) {
            setTextureRotation(value);
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CachedIcon />
            </InputAdornment>
          ),
          inputComponent: NumberFormatDecimalDegrees,
        }}
        variant="filled"
      />
      <Button
        startIcon={<TrackChangesIcon />}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleCornerSnapMenuClick}
      >
        Snap
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={cornerSnapMenuAnchorEl}
        keepMounted
        variant="menu"
        open={Boolean(cornerSnapMenuAnchorEl)}
        onClose={handleCornerSnapMenuClose}
      >
        {range(3).map((index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleCornerSnapMenuClose(index);
            }}
          >
            Corner
            {' '}
            {index + 1}
          </MenuItem>
        ))}
      </Menu>

      <FormControlLabel
        className={classes.checkboxControlLabel}
        control={(
          <Switch
            checked={isPositive}
            onChange={(e) => {
              setIsPositive(e.target.checked);
            }}
            color="primary"
          />
        )}
        label="Fill is positive"
      />
      <PanelSelect
        label="Tile"
        className="select-texture"
        value={fileIndex}
        displayEmpty
        setter={setFileIndex}
        options={textureOptions}
      />
      <DragModeOptionsGroup dragMode={dragMode} />
      <IconButton onClick={sendTexture} color="primary" aria-label="send texture" component="span">
        <TelegramIcon fontSize="large" />
      </IconButton>
    </div>
  );
};
