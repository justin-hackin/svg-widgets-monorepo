/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useDrag, useGesture } from 'react-use-gesture';
import { clamp } from 'lodash';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { Box, Paper } from '@material-ui/core';

// @ts-ignore
import darkTheme from '../DielineViewer/data/material-ui-dark-theme.json';
// eslint-disable-next-line import/no-cycle
import { ShapePreview } from './components/ShapePreview';
import { DRAG_MODES, useDragMode } from './dragMode';
import { TextureSvg } from './components/TextureSvg';
import { TextureControls } from './components/TextureControls';
import { EVENTS } from '../../main/ipc';
import { viewBoxAttrsToString } from './util';
import {
  useMst, Provider, textureTransformEditorStore,
} from './models';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
// TODO: make router wrap with styles
// @ts-ignore
export const theme = createMuiTheme(darkTheme);

// TODO: find classes type
// eslint-disable-next-line no-shadow
const TextureTransformEditorLOC = observer(({ classes }) => {
  const dragMode = useDragMode();
  // ==================================================================================================================
  const {
    placementAreaDimensions, setPlacementAreaDimensions,
    textureEditorUpdateHandler,
    absoluteMovementToSvg, translateAbsoluteCoordsToRelative,
    texture, boundary,
    viewScalePercentStr, viewScaleCenterPercentStr,
    faceFittingScale,
    minImageScale, maxImageScale,
    viewScaleDiff, setViewScaleDiff, reconcileViewScaleDiff,
  } = useMst();
  const {
    setTranslateDiff, setRotateDiff, setScaleDiff, setTransformOriginDiff,
    reconcileTranslateDiff, reconcileRotateDiff, reconcileScaleDiff, reconcileTransformOriginDiff,
  } = texture || {};

  // Init
  useEffect(() => {
    globalThis.ipcRenderer.on(EVENTS.UPDATE_TEXTURE_EDITOR, textureEditorUpdateHandler);

    const resizeHandler = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setPlacementAreaDimensions({ width: width / 2, height });
    };

    window.addEventListener('resize', resizeHandler);

    setTimeout(() => {
      resizeHandler();
    });

    globalThis.ipcRenderer.send(EVENTS.REQUEST_SHAPE_UPDATE);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      globalThis.ipcRenderer.removeListener(EVENTS.UPDATE_TEXTURE_EDITOR, textureEditorUpdateHandler);
    };
  }, []);

  // TODO: drag and drop functionality, removed in fd71f4aba9dd4a698e5a2667595cff82c8fb5cf5
  // see commit message for rationale

  const textureTranslationUseDrag = useDrag(({ movement, down }) => {
    // early exit not possible before hooks
    if (dragMode === DRAG_MODES.TRANSLATE) {
      if (down) {
        setTranslateDiff(absoluteMovementToSvg(movement));
      } else {
        reconcileTranslateDiff();
      }
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        setRotateDiff((movement[1] / placementAreaDimensions.height) * 360);
      } else {
        reconcileRotateDiff();
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        setScaleDiff((movement[1] / placementAreaDimensions.height) + 1);
      } else {
        reconcileScaleDiff();
      }
    }
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down }) => {
    // accommodates the scale of svg so that the texture stays under the mouse
    const relDelta = translateAbsoluteCoordsToRelative(movement);
    if (down) {
      setTransformOriginDiff(relDelta);
    } else {
      reconcileTransformOriginDiff();
    }
  });


  // mouse wheel scale/rotate/zoom
  const viewUseWheel = useGesture({
    onWheel: ({ movement: [, y] }) => {
      if (!placementAreaDimensions || !boundary) { return; }
      const percentHeightDelta = (y / placementAreaDimensions.height);
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        const newViewScaleMux = (percentHeightDelta + 1) * viewScaleDiff;
        setViewScaleDiff(newViewScaleMux);
        return;
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        setRotateDiff(texture.rotateDiff + percentHeightDelta * 90);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        setScaleDiff(clamp((percentHeightDelta + 1) * texture.scaleDiff, minImageScale, maxImageScale));
      }
    },
    onWheelEnd: () => {
      if (!placementAreaDimensions || !boundary) { return; }
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        reconcileViewScaleDiff();
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        reconcileRotateDiff();
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        reconcileScaleDiff();
      }
    },
  });

  if (!placementAreaDimensions || !boundary) { return null; }
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...viewUseWheel()}>
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview />
        </div>
        <Paper
          // @ts-ignore
          component="svg"
          square
          elevation={5}
          className="svg-container"
          width="50%"
          height="100%"
          style={{ overflow: 'hidden', width: '50%' }}
        >
          <svg
            x={viewScaleCenterPercentStr}
            y={viewScaleCenterPercentStr}
            width={viewScalePercentStr}
            height={viewScalePercentStr}
            className="root-svg"
            viewBox={viewBoxAttrsToString(boundary.viewBoxAttrs)}
          >
            <TextureSvg
              showCenterMarker
              {...{
                texture,
                boundary,
                faceFittingScale,
                textureTranslationUseDrag,
                transformOriginUseDrag,
              }}
            />
          </svg>
        </Paper>

        <TextureControls {...{ classes, dragMode }} />
      </Box>
    </ThemeProvider>
  );
});

function TextureTransformEditorHOC({ classes }) {
  return (
    <Provider value={textureTransformEditorStore}>
      <TextureTransformEditorLOC classes={classes} />
    </Provider>
  );
}

export const TextureTransformEditor = withStyles({
  root: {
    backgroundColor:
     '#333',
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    color: '#fff',
  },
  select: {
    display: 'flex', position: 'absolute', top: 0, right: 0,
  },
  rotationInput: {
    width: '6.5em',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    zIndex: 100,
  },
  checkboxControlLabel: {
    color: '#fff',
  },
// @ts-ignore
})(TextureTransformEditorHOC);
