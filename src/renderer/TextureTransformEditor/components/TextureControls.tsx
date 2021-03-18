import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem, Toolbar, AppBar, Tooltip,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import SaveIcon from '@material-ui/icons/Save';
import PublishIcon from '@material-ui/icons/Publish';
import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';
import { useHistory } from 'react-router-dom';
import clsx from 'clsx';

import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { HistoryButtons } from
  '../../DielineViewer/widgets/PyramidNet/PyramidNetControlPanel/components/HistoryButtons';
import { DEFAULT_SLIDER_STEP } from '../../common/constants';
import { extractCutHolesFromSvgString } from '../../../common/util/svg';
import { PanelSliderComponent } from '../../common/components/PanelSliderComponent';
import { ShapeSelect } from '../../common/components/ShapeSelect';
import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../../DielineViewer/style';
import { EVENTS } from '../../../common/constants';

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
  const browserHistory = useHistory();
  const classes = useStyles();
  const workspaceStore = useWorkspaceMst();
  const pluginModel:IPyramidNetPluginModel = workspaceStore.selectedStore;
  const {
    texture, sendTextureToDielineEditor, saveTextureArrangement, openTextureArrangement, decorationBoundary,
    selectedTextureNodeIndex, showNodes, setShowNodes, autoRotatePreview, setAutoRotatePreview,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner, repositionSelectedNodeOverCorner,
    history, shapePreview: { downloadShapeGLTF },
    setTexturePath, setTextureImage,
    shapeName,
    modifierTracking: { dragMode = undefined } = {},
  } = pluginModel.textureEditor;
  const { pattern, rotate: textureRotate, hasPathPattern } = texture || {};
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
    <AppBar color="inherit" position="relative">
      <Toolbar
        className={clsx({
          [classes.textureToolbar]: true,
          [classes.textureToolbarWithTexture]: !!texture,
        })}
        variant="dense"
      >
        <IconButton
          onClick={() => {
            browserHistory.goBack();
          }}
          aria-label="send texture"
          component="span"
        >
          <ArrowBackIcon fontSize="large" />
        </IconButton>
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
          <PublishIcon fontSize="large" />
        </IconButton>
        <HistoryButtons history={history} />
        {pattern && !hasPathPattern && (
          <FormControlLabel
            className={classes.checkboxControlLabel}
            labelPlacement="top"
            control={(
              <Switch
                checked={pattern.isBordered}
                onChange={(e) => {
                  pattern.setIsBordered(e.target.checked);
                }}
                color="primary"
              />
            )}
            label="Bordered"
          />
        )}

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
        <ShapeSelect
          isCompactDisplay
          value={shapeName}
          onChange={(e) => {
            pluginModel.pyramidNetSpec.setPyramidShapeName(e.target.value);
          }}
          name="polyhedron-shape"
        />
        <Tooltip title="Open texture arrangement" arrow>
          <span>
            <IconButton
              onClick={() => { openTextureArrangement(); }}
              aria-label="open texture"
              component="span"
            >
              <FolderOpenIcon fontSize="large" />
            </IconButton>
          </span>
        </Tooltip>
        {texture && (
          <>
            <Tooltip title="Save texture arrangement" arrow>
              <span>
                <IconButton
                  onClick={() => {
                    saveTextureArrangement();
                  }}
                  aria-label="save texture"
                  component="span"
                >
                  <SaveIcon fontSize="large" />
                </IconButton>
              </span>
            </Tooltip>
            {hasPathPattern && (
            <>
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
              <PanelSliderComponent
                node={pluginModel.textureEditor}
                property="nodeScaleMux"
                className={classes.nodeScaleMuxSlider}
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
                    checked={pattern.isPositive}
                    onChange={(e) => {
                      pattern.setIsPositive(e.target.checked);
                    }}
                    color="primary"
                  />
                )}
                label="Fill is positive"
              />
              <FormControlLabel
                className={classes.checkboxControlLabel}
                labelPlacement="top"
                control={(
                  <Switch
                    checked={pattern.useAlphaTexturePreview}
                    onChange={(e) => {
                      pattern.setUseAlphaTexturePreview(e.target.checked);
                    }}
                    color="primary"
                  />
                )}
                label="Use Alpha Texture"
              />
            </>
            )}

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
            <DragModeOptionsGroup dragMode={dragMode} />
            <Tooltip title="Download 3D model GLTF" arrow>
              <span>
                <IconButton onClick={() => { downloadShapeGLTF(); }} component="span">
                  <GetAppIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Send shape decoration to Dieline Editor" arrow>
              <span>
                <IconButton
                  onClick={() => {
                    sendTextureToDielineEditor();
                    browserHistory.goBack();
                  }}
                  aria-label="send texture"
                  component="span"
                >
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
