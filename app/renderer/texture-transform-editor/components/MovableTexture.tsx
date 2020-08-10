// @ts-nocheck
import Canvg, { presets } from 'canvg';
import * as React from 'react';
import { useDrag } from 'react-use-gesture';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import {
  Box, Checkbox, FormControlLabel, IconButton, Paper,
} from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import { point, Polygon } from '@flatten-js/core';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { closedPolygonPath } from '../../die-line-viewer/util/shapes/generic';
import { ShapePreview } from './ShapePreview';
import { DRAG_MODES, DragModeOptionsGroup } from './DragModeOptionGroup';
import { extractCutHolesFromSvgString } from '../../die-line-viewer/util/svg';

const { createRef, useEffect, useState } = React;
// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin


function useDragMode() {
  const [pressed, setPressed] = useState({ Shift: false, Alt: false, Control: false });

  useEffect(() => {
    const createHandler = (keyName, value:boolean) => (e) => {
      if (e.key === keyName) {
        setPressed((oldPressed) => ({
          ...oldPressed,
          ...{ [keyName]: value },
        }));
      }
    };

    const createHandlers = (keyName) => [
      window.addEventListener('keydown', createHandler(keyName, true)),
      window.addEventListener('keyup', createHandler(keyName, false)),
    ];

    const shiftHandlers = createHandlers('Shift');
    const altHandlers = createHandlers('Alt');
    const controlHandlers = createHandlers('Control');


    return () => {
      [shiftHandlers, altHandlers, controlHandlers].forEach(([keydown, keyup]) => {
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('keyup', keyup);
      });
    };
  }, []);

  if (pressed.Alt) { return DRAG_MODES.SCALE_VIEW; }
  if (pressed.Control) { return DRAG_MODES.SCALE_TEXTURE; }
  if (pressed.Shift) { return DRAG_MODES.ROTATE; }
  return DRAG_MODES.TRANSLATE;
}

export const theme = createMuiTheme(darkTheme);
const getFitScale = ({ width: boundsWidth, height: boundsHeight } = {},
  { width: imageWidth, height: imageHeight } = {}) => {
  if (!boundsWidth || !boundsHeight || !imageWidth || !imageHeight) { return null; }
  const widthIsClamp = (boundsWidth / boundsHeight) <= (imageWidth / imageHeight);
  return {
    widthIsClamp,
    scale: widthIsClamp ? boundsWidth / imageWidth : boundsHeight / imageHeight,
  };
};
const viewBoxAttrsToString = (vb) => `${vb.xmin} ${vb.ymin} ${vb.width} ${vb.height}`;

const MoveableTextureLOC = ({ classes }) => {
  const dragMode = useDragMode();

  const textureRef = createRef();
  const textureApplicationSvgRef = createRef();
  const [textureCanvas, setTextureCanvas] = useState();

  const [isPositive, setIsPositive] = useState(true);

  const [placementAreaDimensions, setPlacementAreaDimensions] = useState();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState();


  const [faceScale, setFaceScale] = useState(1);
  const [faceScaleMux, setFaceScaleMux] = useState(1);

  const [textureScale, setTextureScale] = useState(1);
  const [textureScaleMux, setTextureScaleMux] = useState(1);
  const textureScaleValue = textureScaleMux * textureScale;

  const [textureRotation, setTextureRotation] = useState(0);
  const [textureRotationDelta, setTextureRotationDelta] = useState(0);

  const [textureTranslation, setTextureTranslation] = useState([0, 0]);

  const [fileList, setFileList] = useState();
  const [fileIndex, setFileIndex] = useState();
  const textureUrl = (fileList && fileIndex != null) ? `/images/textures/${fileList[fileIndex]}` : null;
  const [texturePathD, setTexturePathD] = useState();

  const addTuple = ([ax, ay], [bx, by]) => [ax + bx, ay + by];

  const [boundary, setBoundary] = useState();
  const [shapeId, setShapeId] = useState();

  const setBoundaryWithPoints = (points) => {
    const poly = new Polygon();
    poly.addFace(points);
    const {
      xmin, ymin, xmax, ymax,
    } = poly.box;
    const viewBoxAttrs = {
      xmin, ymin, width: xmax - xmin, height: ymax - ymin,
    };
    setBoundary({ viewBoxAttrs, path: closedPolygonPath(points) });
  };

  // Init
  useEffect(() => {
    ipcRenderer.on('tex>shape-update', (e, faceVertices, aShapeId) => {
      setBoundaryWithPoints(faceVertices.map((vert) => point(...vert)));
      setShapeId(aShapeId);
    });

    window.onresize = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setPlacementAreaDimensions({ width: width / 2, height });
    };
    setTimeout(() => {
      window.onresize();
    });
    ipcRenderer.invoke('list-texture-files').then((list) => {
      setFileIndex(0);
      setFileList(list);
    });
    // needed for the case in which the texture fitting window is reloaded
    // (no-op on initial launch, main calls this when events wired)
    ipcRenderer.send('die>request-shape-update');
  }, []);

  const { viewBoxAttrs, path } = boundary || {};
  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { scale: faceFittingScale = 1 } = getFitScale(placementAreaDimensions, viewBoxAttrs) || {};

  const absoluteMovementToSvg = (absCoords) => absCoords.map(
    (coord) => coord / (faceFittingScale * faceScale),
  );

  const textureUseDrag = useDrag(({ delta, down, movement }) => {
    // accomodates the scale of svg so that the texture stays under the mouse
    if (dragMode === DRAG_MODES.TRANSLATE) {
      setTextureTranslation(addTuple(absoluteMovementToSvg(delta), textureTranslation));
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        setTextureRotationDelta(point(...movement).angle);
      } else {
        setTextureRotationDelta(0);
        setTextureRotation(textureRotation + textureRotationDelta);
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        setTextureScaleMux((movement[1] / placementAreaDimensions.height) + 1);
      } else {
        setTextureScaleMux(1);
        setTextureScale(textureScale * textureScaleMux);
      }
    }
  });

  const frameUseDrag = useDrag(({ down, movement }) => {
    if (dragMode === DRAG_MODES.SCALE_VIEW) {
      if (down) {
        setFaceScaleMux((movement[1] / placementAreaDimensions.height) + 1);
      } else {
        setFaceScaleMux(1);
        setFaceScale(faceScaleMux * faceScale);
      }
    }
  });

  const setTextureDFromFile = () => {
    ipcRenderer.invoke('get-svg-string-by-path', textureUrl)
      .then((svgString) => {
        setTexturePathD(extractCutHolesFromSvgString(svgString));
      });
  };

  useEffect(() => {
    if (textureRef.current && textureUrl) {
      setTextureDFromFile();
    }
  }, [textureRef.current, textureUrl]);

  useEffect(() => {
    if (textureRef.current) {
      const bb = textureRef.current.getBBox();
      setImageDimensions({ width: bb.width, height: bb.height });
    }
  }, [texturePathD]);

  useEffect(() => {
    if (boundary) {
      const { height, width } = boundary.viewBoxAttrs;
      setTextureCanvas(new window.OffscreenCanvas(width, height));
    }
  }, [boundary]);

  useEffect(() => {
    if (textureCanvas && viewBoxAttrs
      && textureTranslation && textureScaleValue != null
      && textureRotation != null && textureApplicationSvgRef.current) {
      const ctx = textureCanvas.getContext('2d');
      const svgStr = `<svg viewBox="${
        viewBoxAttrsToString(viewBoxAttrs)}">${textureApplicationSvgRef.current.outerHTML}</svg>`;
      Canvg.from(ctx, svgStr, presets.offscreen()).then((v) => v.render());
    }
  }, [textureTranslation, textureScaleValue, textureRotation, textureRotationDelta, shapeId]);

  if (!fileList || !placementAreaDimensions || !viewBoxAttrs) { return null; }
  setTextureDFromFile();

  const textureTransformMatrixStr = `translate(${textureTranslation.join(',')}) scale(${textureScaleValue}) rotate(${
    textureRotation + textureRotationDelta})`;

  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));
  const faceScaleMuxed = faceScaleMux * faceScale;
  const faceScalePercentStr = `${faceScaleMuxed * 100}%`;
  const faceScaleCenterPercentStr = `${((1 - faceScaleMuxed) * 100) / 2}%`;
  const sendTexture = async () => {
    const boundaryPathD = path.getD();
    const dd = await ipcRenderer.invoke(
      'intersect-svg', boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive,
    );
    ipcRenderer.send('die>set-die-line-cut-holes', dd, textureTransformMatrixStr);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...frameUseDrag()}>
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview
            width={placementAreaDimensions.width}
            height={placementAreaDimensions.height}
            textureTransform={textureTransformMatrixStr}
            textureCanvas={textureCanvas}
            shapeId={shapeId}
          />
        </div>
        <Paper
          component="svg"
          square
          elevation={5}
          className="svg-container"
          width="50%"
          height="100%"
          style={{ overflow: 'hidden', width: '50%' }}
        >
          <svg
            x={faceScaleCenterPercentStr}
            y={faceScaleCenterPercentStr}
            width={faceScalePercentStr}
            height={faceScalePercentStr}
            className="root-svg"
            viewBox={viewBoxAttrsToString(viewBoxAttrs)}
          >
            <svg
              ref={textureApplicationSvgRef}
              overflow="visible"
            >
              <path
                fill="#FFD900"
                stroke="#000"
                d={path.getD()}
              />
              <path
                pointerEvents="bounding-box"
                ref={textureRef}
                {...textureUseDrag()}
                stroke="#f00"
                fill="#000"
                fillOpacity={0.5}
                d={texturePathD}
                transform={textureTransformMatrixStr}
              />
            </svg>
          </svg>
        </Paper>

        <div className={classes.select}>
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
            value={fileIndex}
            setter={(val) => {
              setFileIndex(parseInt(val, 10));
            }}
            options={options}
          />
          <DragModeOptionsGroup dragMode={dragMode} />
          <IconButton onClick={sendTexture} color="primary" aria-label="send texture" component="span">
            <TelegramIcon fontSize="large" />
          </IconButton>
        </div>
      </Box>
    </ThemeProvider>
  );
};
export const MoveableTexture = withStyles({
  root: {
    backgroundColor: '#333', display: 'block', width: '100%', height: '100%', position: 'absolute', color: '#fff',
  },
  select: {
    display: 'flex', position: 'absolute', top: 0, right: 0,
  },
  loadingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    zIndex: 100,
  },
  checkboxControlLabel: {
    color: '#fff',
  },
})(MoveableTextureLOC);
