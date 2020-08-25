import React from 'react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import TelegramIcon from '@material-ui/icons/Telegram';
import { range } from 'lodash';

import {
  Button, Checkbox, FormControlLabel, IconButton, Menu, MenuItem,
} from '@material-ui/core';

import { PanelSelect } from '../../common/components/PanelSelect';
import { DragModeOptionsGroup } from './DragModeOptionGroup';


export const TextureControls = ({
  classes, textureOptions,
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
          <Checkbox
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
