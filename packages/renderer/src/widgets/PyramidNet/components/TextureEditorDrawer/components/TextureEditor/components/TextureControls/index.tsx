import React, { forwardRef, useState } from 'react';
import {
  AppBar,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Toolbar, Tooltip,
  Typography,
} from '@mui/material';
import { observer } from 'mobx-react';
import CachedIcon from '@mui/icons-material/Cached';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GetAppIcon from '@mui/icons-material/GetApp';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import FilePicker from '@mavedev/react-file-picker';
import HelpIcon from '@mui/icons-material/Help';

import { isNaN, isNumber } from 'lodash';
import NumberFormat from 'react-number-format';
import clsx from 'clsx';

import { styled } from '@mui/styles';
import { SnapMenu } from './components/SnapMenu';
import { TextureEditorModel } from '../../models/TextureEditorModel';
import { resolveImageDimensionsFromBase64, toBase64 } from '../../../../../../../../common/util/data';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../../common/util/tour';
import {
  IS_ELECTRON_BUILD,
  IS_WEB_BUILD,
  TEXTURE_ARRANGEMENT_FILE_EXTENSION,
} from '../../../../../../../../../../common/constants';
import { RawFaceDecorationModel } from '../../../../../../models/RawFaceDecorationModel';
import { HistoryButtons } from '../../../../../HistoryButtons';
import { PyramidNetWidgetModel } from '../../../../../../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../../../../../../models/ImageFaceDecorationPatternModel';
import { TweakableInput } from '../../../../../../../../common/keystone-tweakables/material-ui-controls/TweakableInput';
import { ShapeSelect } from '../../../../../ShapeSelect';
import { useWorkspaceMst } from '../../../../../../../../WidgetWorkspace/models/WorkspaceModel';
import { PathFaceDecorationPatternModel } from '../../../../../../models/PathFaceDecorationPatternModel';
import { PositionableFaceDecorationModel } from '../../../../../../models/PositionableFaceDecorationModel';
import { electronApi } from '../../../../../../../../../../common/electron';

// @ts-ignore
const NumberFormatDecimalDegrees = forwardRef(({ onChange, ...other }, ref) => (
  <NumberFormat
    {...other}
    getInputRef={ref}
    onValueChange={(values) => {
      onChange({
        target: {
          // @ts-ignore
          name: other.name,
          value: values.floatValue,
        },
      });
    }}
    decimalScale={1}
    suffix="°"
  />
));

const UploadButton = ({ onClick = undefined }) => (
  <Tooltip title="Upload raster/vector graphics...">
    <IconButton
      className={TOUR_ELEMENT_CLASSES.UPLOAD_IMAGE}
      onClick={onClick}
      aria-label="send texture"
      component="span"
      size="large"
    >
      <PublishIcon fontSize="large" />
    </IconButton>
  </Tooltip>
);

const classes = {
  toolbar: 'texture-editor__toolbar',
  toolbarWithTexture: 'texture-editor__toolbar--with-texture',
  nodeInputs: 'texture-editor__node-inputs',
  nodeScaleMuxSlider: 'texture-editor__node-scale-mux-slider',
  rotationInput: 'texture-editor__rotation-input',
};

const TextureEditorAppBar = styled(AppBar)(({ theme }) => ({
  '&.MuiAppBar-root': {
    // so that the toolbar goes under the tour tooltips
    // https://mui.com/guides/migration-v4/#appbar
    // zIndex: 100,
  },
  [`& .${classes.toolbar}`]: {
    display: 'flex',
    flexWrap: 'wrap',
    position: 'initial',
    [`&.${classes.toolbarWithTexture}`]: {
      [theme.breakpoints.down('lg')]: {
        justifyContent: 'space-around',
      },
    },
    [`& .${classes.nodeInputs}`]: {
      display: 'inline-flex',
    },
    [`& .${classes.nodeScaleMuxSlider}`]: {
      width: theme.spacing(10),
    },
    [`& .${classes.rotationInput}`]: {
      width: '6.5em',
    },
  },
}));

type OpenTextureArrangementMenuItemProps = { onClick?: () => void, };

// TODO: what's the proper ref type
//  "type OpenTextureArrangementMenuItemRef = typeof MenuItem;" not working
const OpenTextureArrangementMenuItem = forwardRef<any, OpenTextureArrangementMenuItemProps>(
  ({ onClick = undefined }, ref) => (
    <MenuItem ref={ref} onClick={onClick}>
      <ListItemIcon><FolderOpenIcon fontSize="small" /></ListItemIcon>
      <Typography variant="inherit">Open texture arrangement </Typography>
    </MenuItem>
  ),
);

export const TextureControls = observer(({ hasCloseButton }) => {
  const workspaceStore = useWorkspaceMst();
  const widgetModel = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { history } = widgetModel.savedModel;
  const { textureEditor, preferences } = widgetModel;
  const {
    faceDecoration,
    showNodes, autoRotatePreview,
    shapePreview,
    shapeName,
  //  TODO: why does code loose type info when destructuring this
  } = textureEditor as TextureEditorModel;

  const [fileMenuRef, setFileMenuRef] = useState<HTMLElement>(null);
  const resetFileMenuRef = () => { setFileMenuRef(null); };

  const ForwardRefdOpenMenuItem = forwardRef((_, ref) => (
    <FilePicker
      extensions={[`.${TEXTURE_ARRANGEMENT_FILE_EXTENSION}`]}
      onFilePicked={async (file) => {
        // TODO: why doesn't file.type match downloadFile mime type 'application/json'
        if (file.type === '') {
          textureEditor.setTextureArrangementFromFileData(JSON.parse(await file.text()));
        }
        resetFileMenuRef();
        //  TODO: snack bar error if wrong type
      }}
    >
      <OpenTextureArrangementMenuItem ref={ref} />
    </FilePicker>
  ));

  if (faceDecoration instanceof RawFaceDecorationModel || !shapePreview) { return null; }

  // TODO: add whitespace, improve button definition and input alignment
  return (
    <>
      <TextureEditorAppBar position="relative">
        <Toolbar
          className={clsx(classes.toolbar, faceDecoration && classes.toolbarWithTexture)}
          variant="dense"
        >
          {/* web app uses texture editor as standalone component without drawer */}
          {hasCloseButton && (
          <>
            <IconButton
              onClick={() => {
                widgetModel.setTextureEditorOpen(false);
              }}
              aria-label="close texture editor"
              component="span"
              size="large"
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
            <Divider />
          </>
          )}
          <Tooltip title="File...">
            <IconButton
              className={TOUR_ELEMENT_CLASSES.TEXTURE_EDITOR_FILE_MENU}
              onClick={(e) => {
                setFileMenuRef(e.currentTarget);
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={fileMenuRef} open={Boolean(fileMenuRef)} keepMounted onClose={resetFileMenuRef}>
            {(() => {
              if (IS_WEB_BUILD) {
                return (<ForwardRefdOpenMenuItem />);
              }
              return (
                <OpenTextureArrangementMenuItem onClick={() => {
                  textureEditor.openTextureArrangement();
                  resetFileMenuRef();
                }}
                />
              );
            })()}
            {/* Menu component emits error when child is React.Fragment */}
            { faceDecoration
          && [
            (
              <MenuItem
                key={0}
                onClick={() => {
                  textureEditor.saveTextureArrangement();
                  resetFileMenuRef();
                }}
              >
                <ListItemIcon><SaveIcon fontSize="small" /></ListItemIcon>
                <Typography variant="inherit">Save texture arrangement </Typography>
              </MenuItem>
            ),
            (
              <MenuItem
                key={1}
                onClick={async () => {
                  await shapePreview.downloadShapeGLTF();
                  resetFileMenuRef();
                }}
              >
                <ListItemIcon><GetAppIcon fontSize="small" /></ListItemIcon>
                <Typography variant="inherit">Download 3D model GLB</Typography>
              </MenuItem>
            ),
          ]}
          </Menu>

          {(() => {
            if (IS_ELECTRON_BUILD) {
              return (
                <UploadButton onClick={async () => {
                  const patternInfo = await electronApi.getPatternInfoFromDialog();
                  textureEditor.assignTextureFromPatternInfo(patternInfo);
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
                        textureEditor.assignTextureFromPatternInfo({
                          isPath: true,
                          svgString,
                          sourceFileName: file.name,
                        });
                      } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
                        //  file is either png or jpg
                        const imageData = await toBase64(file);
                        const dimensions = await resolveImageDimensionsFromBase64(imageData);
                        textureEditor.assignTextureFromPatternInfo({
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
            throw new Error('unexpected build environment');
          })()}
          <ShapeSelect
            className={TOUR_ELEMENT_CLASSES.SHAPE_SELECT}
            isCompactDisplay
            node={shapeName}
          />
          <FormControlLabel
            className={TOUR_ELEMENT_CLASSES.ROTATE_3D}
            labelPlacement="top"
            control={(
              <Switch
                checked={autoRotatePreview}
                onChange={(e) => {
                  textureEditor.setAutoRotatePreview(e.target.checked);
                }}
                color="primary"
              />
        )}
            label="Rotate 3D"
          />

          {history && (<HistoryButtons history={history} />)}

          {faceDecoration?.pattern && faceDecoration.pattern instanceof ImageFaceDecorationPatternModel && (
          <FormControlLabel
            className={TOUR_ELEMENT_CLASSES.IS_BORDERED}
            labelPlacement="top"
            control={(
              <Switch
                checked={faceDecoration.pattern.isBordered}
                onChange={(e) => {
                  (faceDecoration.pattern as ImageFaceDecorationPatternModel).setIsBordered(e.target.checked);
                }}
                color="primary"
              />
          )}
            label="Bordered"
          />
        )}

          <SnapMenu />
          {faceDecoration instanceof PositionableFaceDecorationModel && (
          <>
            {/* menu content at bottom section */}
            {faceDecoration.pattern instanceof PathFaceDecorationPatternModel && (
            <>
              <span className={clsx(TOUR_ELEMENT_CLASSES.NODE_INPUTS, classes.nodeInputs)}>
                <FormControlLabel
                  labelPlacement="top"
                  control={(
                    <Switch
                      checked={showNodes}
                      onChange={(e) => {
                        textureEditor.setShowNodes(e.target.checked);
                      }}
                      color="primary"
                    />
                  )}
                  label="Node selection"
                />
                <TweakableInput
                  node={widgetModel.textureEditor.nodeScaleMux}
                  className={classes.nodeScaleMuxSlider}
                />
              </span>
              <FormControlLabel
                className={TOUR_ELEMENT_CLASSES.FILL_IS_POSITIVE}
                labelPlacement="top"
                control={(
                  <Switch
                    checked={faceDecoration.pattern.isPositive}
                    onChange={(e) => {
                    // @ts-ignore why no inference?
                      faceDecoration.pattern.setIsPositive(e.target.checked);
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
                    checked={faceDecoration.pattern.useAlphaTexturePreview}
                    onChange={(e) => {
                    // @ts-ignore
                      faceDecoration.pattern.setUseAlphaTexturePreview(e.target.checked);
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
              value={faceDecoration.transform.rotate}
              onChange={({ target: { value } = {} }) => {
              // TODO: use onKeyPress for enter submission
              // https://github.com/mui-org/material-ui/issues/5393#issuecomment-304707345
              // TODO: once above is fixed, use textureRotateDragged as value
                if (isNumber(value) && !isNaN(value)) {
                  faceDecoration.transform.setRotate(value);
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
            {/* TODO: use draft? */}
          </>
          )}
          { IS_WEB_BUILD && (
          <IconButton
            onClick={() => {
              preferences.setNeedsTour(true);
            }}
            aria-label="send texture"
            component="span"
            size="large"
          >
            <HelpIcon fontSize="large" />
          </IconButton>
          )}
        </Toolbar>
      </TextureEditorAppBar>
    </>
  );
});
