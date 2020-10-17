import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';

import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { EVENTS } from '../../../main/ipc';
import { useMst } from '../models';

const NumberFormatDecimalDegrees = ({ inputRef, onChange, ...other }) => (
  <NumberFormat
    {...other}
    getInputRef={inputRef}
    onValueChange={(values) => {
      onChange({
        target: {
          name: other.name,
          value: values.floatValue,
        },
      });
    }}
    decimalScale={1}
    suffix="°"
  />
);


export const TextureControls = observer(({
  classes, dragMode,
}) => {
  const {
    texture, sendTexture, setTextureFromFile,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner,
  } = useMst();
  const [cornerSnapMenuAnchorEl, setCornerSnapMenuAnchorEl] = React.useState(null);

  const { isPositive, setIsPositive, rotate: textureRotate } = texture || {};
  const handleCornerSnapMenuClick = (event) => {
    setCornerSnapMenuAnchorEl(event.currentTarget);
  };


  const handleCornerSnapMenuClose = (index, isOriginOnly: boolean = false) => {
    if (index !== undefined) {
      if (isOriginOnly) {
        repositionOriginOverCorner(index);
      } else {
        repositionTextureWithOriginOverCorner(index);
      }
    }
    setCornerSnapMenuAnchorEl(null);
  };

  return (
    <div className={classes.select}>
      {texture && (
      <>
        <TextField
          className={classes.rotationInput}
          label="Rotate"
          value={textureRotate}
          onChange={({ target: { value } = {} }) => {
            // TODO: this should not run when value changes via props
            // TODO: once above is fixed, use textureRotateDragged
            if (isNumber(value) && !isNaN(value)) {
              texture.setRotate(value);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CachedIcon />
              </InputAdornment>
            ),
            // @ts-ignore
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
          onClose={() => {
            handleCornerSnapMenuClose(undefined);
          }}
        >
          {range(3).map((index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleCornerSnapMenuClose(index);
              }}
            >
              Texture & origin to corner
              {' '}
              {index + 1}
            </MenuItem>
          ))}
          {range(3).map((index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleCornerSnapMenuClose(index, true);
              }}
            >
              Origin to corner
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
        <DragModeOptionsGroup dragMode={dragMode} />
        <IconButton onClick={sendTexture} color="primary" aria-label="send texture" component="span">
          <TelegramIcon fontSize="large" />
        </IconButton>
      </>
      )}
      <IconButton
        onClick={async () => {
          const texturePath = await globalThis.ipcRenderer.invoke(EVENTS.GET_SVG_PATH);
          if (texturePath) {
            setTextureFromFile(texturePath);
          }
        }}
        color="primary"
        aria-label="send texture"
        component="span"
      >
        <FolderOpenIcon fontSize="large" />
      </IconButton>
    </div>
  );
});
