import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem, Toolbar, AppBar,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';
import clsx from 'clsx';

import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { EVENTS } from '../../../main/ipc';
import { useMst } from '../models';
import { PanelSlider } from '../../common/components/PanelSlider';
import { HistoryButtons } from '../../DielineViewer/components/ControlPanel/components/HistoryButtons';
import { useStyles } from '../style';
import { VERY_SMALL_NUMBER } from '../../common/constants';


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


export const TextureControls = observer(() => {
  const {
    texture, sendTexture, setTextureFromFile, decorationBoundary, selectedTextureNodeIndex,
    showNodes, setShowNodes, nodeScaleMux, setNodeScaleMux, autoRotatePreview, setAutoRotatePreview,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner, repositionSelectedNodeOverCorner,
    history, downloadShapeGLTF,
  } = useMst();
  const classes = useStyles();
  const { isPositive, setIsPositive, rotate: textureRotate } = texture || {};
  const numFaceSides = decorationBoundary.vertices.length;

  // when truthy, snap menu is open
  const [positionSnapMenuAnchorEl, setPositionSnapMenuAnchorEl] = React.useState(null);

  const handleCornerSnapMenuClick = (event) => {
    setPositionSnapMenuAnchorEl(event.currentTarget);
  };

  const resetPositionSnapMenuAnchorEl = () => { setPositionSnapMenuAnchorEl(null); };

  const handleTextureOriginSnapMenuClose = (index) => {
    if (index !== undefined) {
      repositionTextureWithOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const handleOriginSnapMenuClose = (index) => {
    if (index !== undefined) {
      repositionOriginOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  const handleSelectedNodeSnapMenuClose = (index) => {
    if (index !== undefined) {
      repositionSelectedNodeOverCorner(index);
    }
    resetPositionSnapMenuAnchorEl();
  };

  // TODO: add whitespace, improve button definition and input alignment
  return (
    <AppBar
      color="inherit"
      position="fixed"
    >
      <Toolbar
        className={clsx({
          [classes.textureToolbar]: true,
          [classes.textureToolbarWithTexture]: !!texture,
        })}
        variant="dense"
      >
        <IconButton
          onClick={async () => {
            const texturePath = await globalThis.ipcRenderer.invoke(EVENTS.GET_SVG_FILE_PATH, {
              message: 'Open texture path',
            });
            if (texturePath) {
              setTextureFromFile(texturePath);
            }
          }}
          aria-label="send texture"
          component="span"
        >
          <FolderOpenIcon fontSize="large" />
        </IconButton>
        <HistoryButtons history={history} />
        {texture && (
          <>
            <IconButton onClick={() => { downloadShapeGLTF(); }} component="span">
              <GetAppIcon />
            </IconButton>
            <IconButton onClick={() => { sendTexture(); }} aria-label="send texture" component="span">
              <TelegramIcon fontSize="large" />
            </IconButton>
            <FormControlLabel
              className={classes.checkboxControlLabel}
              labelPlacement="top"
              control={(
                <Switch
                  checked={showNodes}
                  onChange={(e) => {
                    setShowNodes(e.target.checked);
                  }}
                  color="primary"
                />
              )}
              label="Node selection"
            />
            <PanelSlider
              className={classes.nodeScaleMuxSlider}
              setter={(val) => {
                setNodeScaleMux(val);
              }}
              value={nodeScaleMux}
              valuePath="nodeScaleMux"
              label="Node size"
              min={0.1}
              max={10}
              step={VERY_SMALL_NUMBER}
            />
            <FormControlLabel
              className={classes.checkboxControlLabel}
              labelPlacement="top"
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
            <TextField
              className={classes.rotationInput}
              label="Rotate"
              value={textureRotate}
              onChange={({ target: { value } = {} }) => {
                // TODO: use onKeyPress for enter submission
                // https://github.com/mui-org/material-ui/issues/5393#issuecomment-304707345
                // TODO: once above is fixed, use textureRotateDragged as value
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
              anchorEl={positionSnapMenuAnchorEl}
              keepMounted
              variant="menu"
              open={Boolean(positionSnapMenuAnchorEl)}
              onClose={() => {
                resetPositionSnapMenuAnchorEl();
              }}
            >
              {range(numFaceSides).map((index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleTextureOriginSnapMenuClose(index);
                  }}
                >
                  Texture & origin to corner
                  {' '}
                  {index + 1}
                </MenuItem>
              ))}
              {range(numFaceSides).map((index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleOriginSnapMenuClose(index);
                  }}
                >
                  Origin to corner
                  {' '}
                  {index + 1}
                </MenuItem>
              ))}

              {showNodes && selectedTextureNodeIndex !== null && range(numFaceSides).map((index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    handleSelectedNodeSnapMenuClose(index);
                  }}
                >
                  Selected node to corner
                  {' '}
                  {index + 1}
                </MenuItem>
              ))}
            </Menu>
            <DragModeOptionsGroup />
            <FormControlLabel
              className={classes.checkboxControlLabel}
              labelPlacement="top"
              control={(
                <Switch
                  checked={autoRotatePreview}
                  onChange={(e) => {
                    setAutoRotatePreview(e.target.checked);
                  }}
                  color="primary"
                />
              )}
              label="Auto-rotate preview"
            />
          </>
        )}
      </Toolbar>
    </AppBar>
  );
});
