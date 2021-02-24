import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem, Toolbar, AppBar, Tooltip,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import ArchiveIcon from '@material-ui/icons/Archive';

import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';
import clsx from 'clsx';

import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { EVENTS } from '../../../main/ipc';
import { useMst } from '../models';
import { HistoryButtons } from
  '../../DielineViewer/widgets/PyramidNet/PyramidNetControlPanel/components/HistoryButtons';
import { useStyles } from '../style';
import { DEFAULT_SLIDER_STEP } from '../../common/constants';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { PanelSliderComponent } from '../../common/components/PanelSliderComponent';
import { ITextureTransformEditorModel } from '../models/TextureTransformEditorModel';

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
  const store = useMst();
  const {
    texture, sendTexture, saveTexture, decorationBoundary, selectedTextureNodeIndex,
    showNodes, setShowNodes, autoRotatePreview, setAutoRotatePreview,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner, repositionSelectedNodeOverCorner,
    history, downloadShapeGLTF,
    setTexturePath, setTextureImage,
    isBordered, setIsBordered,
  }: ITextureTransformEditorModel = store;
  const classes = useStyles();
  const {
    pattern: { isPositive = undefined } = {}, setIsPositive, rotate: textureRotate, hasPathPattern,
  } = texture || {};
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
    <AppBar color="inherit">
      <Toolbar
        className={clsx({
          [classes.textureToolbar]: true,
          [classes.textureToolbarWithTexture]: !!texture,
        })}
        variant="dense"
      >
        <IconButton
          onClick={async () => {
            const patternInfo = await globalThis.ipcRenderer.invoke(EVENTS.SELECT_TEXTURE);
            if (patternInfo) {
              if (patternInfo.isPath) {
                const { svgString, sourceFileName } = patternInfo;
                const pathD = extractCutHolesFromSvgString(svgString);
                setTexturePath(pathD, sourceFileName);
              } else {
                const { imageData, dimensions, sourceFileName } = patternInfo.pattern;
                setTextureImage(imageData, dimensions, sourceFileName);
              }
            }
          }}
          aria-label="send texture"
          component="span"
        >
          <FolderOpenIcon fontSize="large" />
        </IconButton>
        <HistoryButtons history={history} />
        <FormControlLabel
          className={classes.checkboxControlLabel}
          labelPlacement="top"
          control={(
            <Switch
              checked={isBordered}
              onChange={(e) => {
                setIsBordered(e.target.checked);
              }}
              color="primary"
            />
          )}
          label="Bordered"
        />

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
        {texture && (
          <>
            <FormControlLabel
              className={classes.checkboxControlLabel}
              labelPlacement="top"
              control={(
                <Switch
                  checked={showNodes}
                  disabled={!hasPathPattern}
                  onChange={(e) => {
                    setShowNodes(e.target.checked);
                  }}
                  color="primary"
                />
              )}
              label="Node selection"
            />
            <PanelSliderComponent
              node={store}
              property="nodeScaleMux"
              className={classes.nodeScaleMuxSlider}
              disabled={!hasPathPattern}
              label="Node size"
              min={0.1}
              max={10}
              step={DEFAULT_SLIDER_STEP}
            />
            <FormControlLabel
              className={classes.checkboxControlLabel}
              labelPlacement="top"
              control={(
                <Switch
                  checked={isPositive}
                  disabled={!hasPathPattern}
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
            <Tooltip title="Download 3D model GLTF" arrow>
              <span>
                <IconButton onClick={() => { downloadShapeGLTF(); }} component="span">
                  <GetAppIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Export texture arrangement" arrow>
              <span>
                <IconButton onClick={() => { saveTexture(); }} aria-label="export texture" component="span">
                  <ArchiveIcon fontSize="large" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Send shape decoration to Dieline Editor" arrow>
              <span>
                <IconButton onClick={() => { sendTexture(); }} aria-label="send texture" component="span">
                  <TelegramIcon fontSize="large" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
});
