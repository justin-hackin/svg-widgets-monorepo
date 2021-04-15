import React from 'react';
import {
  TextField, InputAdornment,
  Button, Switch, FormControlLabel, IconButton, Menu, MenuItem, Toolbar, AppBar, Tooltip, Divider,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import TrackChangesIcon from '@material-ui/icons/TrackChanges';
import CachedIcon from '@material-ui/icons/Cached';
import TelegramIcon from '@material-ui/icons/Telegram';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import GetAppIcon from '@material-ui/icons/GetApp';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import SaveIcon from '@material-ui/icons/Save';
import PublishIcon from '@material-ui/icons/Publish';
import FilePicker from '@mavedev/react-file-picker';
import HelpIcon from '@material-ui/icons/Help';

import { range, isNumber, isNaN } from 'lodash';
import NumberFormat from 'react-number-format';
import clsx from 'clsx';

import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { HistoryButtons } from
  '../../../../renderer/DielineViewer/widgets/PyramidNet/PyramidNetControlPanel/components/HistoryButtons';
import { PanelSliderComponent } from '../../PanelSliderComponent';
import { ShapeSelect } from '../../ShapeSelect';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../../../style/style';
import {
  DEFAULT_SLIDER_STEP,
  EVENTS,
  INVALID_BUILD_ENV_ERROR,
  IS_ELECTRON_BUILD,
  IS_WEB_BUILD,
} from '../../../constants';
import { ITextureEditorModel } from '../models/TextureEditorModel';
import { resolveImageDimensionsFromBase64, toBase64 } from '../../../util/data';
import { TOUR_ELEMENT_CLASSES } from '../../../util/tour';

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

const UploadButton = ({ onClick = undefined }) => (
  <IconButton
    className={TOUR_ELEMENT_CLASSES.UPLOAD_IMAGE}
    onClick={onClick}
    aria-label="send texture"
    component="span"
  >
    <PublishIcon fontSize="large" />
  </IconButton>
);

export const TextureControls = observer(({ hasCloseButton }) => {
  const classes = useStyles();
  const workspaceStore = useWorkspaceMst();
  const { setNeedsTour } = workspaceStore.preferences;
  const pluginModel:IPyramidNetPluginModel = workspaceStore.selectedStore;
  const {
    texture, sendTextureToDielineEditor, saveTextureArrangement, openTextureArrangement, decorationBoundary,
    selectedTextureNodeIndex, showNodes, setShowNodes, autoRotatePreview, setAutoRotatePreview,
    repositionTextureWithOriginOverCorner, repositionOriginOverCorner, repositionSelectedNodeOverCorner,
    shapePreview: { downloadShapeGLTF },
    assignTextureFromPatternInfo,
    shapeName,
    modifierTracking: { dragMode = undefined } = {},
    history,
  } = pluginModel.textureEditor as ITextureEditorModel;
  const {
    pattern, rotate: textureRotate, hasPathPattern,
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
    <AppBar className={classes.textureEditorControls} color="inherit" position="relative">
      <Toolbar
        className={clsx(classes.textureToolbar, texture && classes.textureToolbarWithTexture)}
        variant="dense"
      >
        {/* web app uses texture editor as standalone component without drawer */}
        {hasCloseButton && (
          <>
            <IconButton
              onClick={() => {
                pluginModel.setTextureEditorOpen(false);
              }}
              aria-label="close texture editor"
              component="span"
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
            <Divider />
          </>
        )}
        <ShapeSelect
          className={TOUR_ELEMENT_CLASSES.SHAPE_SELECT}
          isCompactDisplay
          value={shapeName}
          onChange={(e) => {
            pluginModel.pyramidNetSpec.setPyramidShapeName(e.target.value);
          }}
          name="polyhedron-shape"
        />
        <FormControlLabel
          className={TOUR_ELEMENT_CLASSES.ROTATE_3D}
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
          label="Rotate 3D"
        />

        {/* ************************************************************* */}

        {/*  @ts-ignore */}
        {(() => { // eslint-disable-line consistent-return
          if (IS_ELECTRON_BUILD) {
            return (
              <UploadButton onClick={async () => {
                const patternInfo = await globalThis.ipcRenderer.invoke(EVENTS.DIALOG_ACQUIRE_PATTERN_INFO);
                assignTextureFromPatternInfo(patternInfo);
              }}
              />
            );
          }
          if (IS_WEB_BUILD) {
            return (
              <FilePicker
                extensions={['.jpg', '.jpeg', '.png', '.svg']}
                onFilePicked={async (file) => {
                  if (file) {
                    if (file.type === 'image/svg+xml') {
                      const svgString = await file.text();
                      assignTextureFromPatternInfo({
                        isPath: true,
                        svgString,
                        sourceFileName: file.name,
                      });
                    } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
                    //  file is either png or jpg
                      const imageData = await toBase64(file);
                      const dimensions = await resolveImageDimensionsFromBase64(imageData);
                      assignTextureFromPatternInfo({
                        isPath: false,
                        pattern: {
                          imageData,
                          dimensions,
                          sourceFileName: file.name,
                        },
                      });
                    }
                  // TODO: user can still pick non-image, emit snackbar error in this case
                  }
                }}
              >
                <UploadButton />
              </FilePicker>
            );
          }
          throw new Error(INVALID_BUILD_ENV_ERROR);
        })()}
        {history && (<HistoryButtons history={history} />)}
        <Tooltip title="Download 3D model GLTF" arrow>
          <span>
            <IconButton
              className={TOUR_ELEMENT_CLASSES.DOWNLOAD_3D}
              onClick={() => { downloadShapeGLTF(); }}
              component="span"
            >
              <GetAppIcon />
            </IconButton>
          </span>
        </Tooltip>
        <DragModeOptionsGroup dragMode={dragMode} />
        {pattern && !hasPathPattern && (
          <FormControlLabel
            className={TOUR_ELEMENT_CLASSES.IS_BORDERED}
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

        <Tooltip title="Open texture arrangement" arrow>
          <span>
            <IconButton
              className={TOUR_ELEMENT_CLASSES.OPEN_TEXTURE_ARRANGEMENT}
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
                  className={TOUR_ELEMENT_CLASSES.SAVE_TEXTURE_ARRANGEMENT}
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
            <Button
              className={TOUR_ELEMENT_CLASSES.SNAP_MENU}
              startIcon={<TrackChangesIcon />}
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleCornerSnapMenuClick}
            >
              Snap
            </Button>
            {/* menu content at bottom section */}
            {hasPathPattern && (
              <>
                <span className={clsx(TOUR_ELEMENT_CLASSES.NODE_INPUTS, classes.textureEditorNodeInputs)}>
                  <FormControlLabel
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
                </span>
                <FormControlLabel
                  className={TOUR_ELEMENT_CLASSES.FILL_IS_POSITIVE}
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
                  className={TOUR_ELEMENT_CLASSES.USE_ALPHA_TEXTURE}
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
              className={clsx(classes.rotationInput, TOUR_ELEMENT_CLASSES.ROTATE_INPUT)}
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
            {/* ===================== SNAP MENU ===================== */}
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

            <Tooltip title="Send shape decoration to Dieline Editor" arrow>
              <span>
                <IconButton
                  onClick={() => {
                    sendTextureToDielineEditor();
                    pluginModel.setTextureEditorOpen(false);
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
        { IS_WEB_BUILD && (
        <IconButton
          onClick={() => {
            setNeedsTour(true);
          }}
          aria-label="send texture"
          component="span"
        >
          <HelpIcon fontSize="large" />
        </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
});
