// @ts-nocheck
import Canvg, { presets } from 'canvg';
import React, { createRef, useEffect, useState } from 'react';
import { useDrag } from 'react-use-gesture';
import ReactDOMServer from 'react-dom/server';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import {
  Box, Checkbox, CircularProgress, FormControlLabel, IconButton, Paper,
} from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import { Matrix, point, Polygon } from '@flatten-js/core';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { extractCutHolesFromSvgString } from '../../die-line-viewer/util/svg';
import { closedPolygonPath } from '../../die-line-viewer/util/shapes/generic';
import { ShapePreview } from './ShapePreview';
import { DRAG_MODES, DragModeOptionsGroup } from './DragModeOptionGroup';

// TODO: extract this
// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
export const FaceIntersectionSVG = ({
  boundaryD, textureD, textureTransform, isPositive,
}) => (
  <svg>
    {isPositive && (
    <rect fill="yellow" id="texture-bounds" x={0} y={0} width={999999} height={999999} transform={textureTransform} />
    )}
    <path fill="purple" id="texture" d={textureD} transform={textureTransform} />
    <path fill="blue" id="tile" d={boundaryD} />
  </svg>
);

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
  const textureRef = createRef();
  const textureApplicationSvgRef = createRef();
  const [textureCanvas, setTextureCanvas] = useState();

  const [isLoading, setIsLoading] = useState(false);
  const [isPositive, setIsPositive] = useState(true);

  const [screenDimensions, setScreenDimensions] = useState();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState();

  const [dragMode, setDragMode] = useState(DRAG_MODES.TRANSLATE);

  const [faceScale, setFaceScale] = useState(0.8);
  const [faceScaleMux, setFaceScaleMux] = useState(1);

  const [textureScaleRatio, setTextureScaleRatio] = useState(0.5);
  const [textureScaleRatioMux, setTextureScaleRatioMux] = useState(1);
  const textureScaleRatioMuxed = textureScaleRatioMux * textureScaleRatio;

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

  useEffect(() => {
    ipcRenderer.on('tex>shape-update', (e, faceVertices, aShapeId) => {
      setBoundaryWithPoints(faceVertices.map((vert) => point(...vert)));
      setShapeId(aShapeId);
    });
    ipcRenderer.send('die>request-shape-update');

    window.onresize = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setScreenDimensions({ width, height });
    };
    setTimeout(() => {
      window.onresize();
    });
    ipcRenderer.invoke('list-texture-files').then((list) => {
      setFileIndex(0);
      setFileList(list);
    });
  }, []);


  const { viewBoxAttrs, path } = boundary || {};
  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { scale: textureFittingScale = 1 } = getFitScale(viewBoxAttrs, imageDimensions) || {};
  const { scale: faceFittingScale = 1 } = getFitScale(screenDimensions, viewBoxAttrs) || {};
  const absoluteMovementToSvg = (absCoords) => absCoords.map(
    (coord) => (coord / faceScale) / faceFittingScale,
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
        setTextureScaleRatioMux((movement[1] / screenDimensions.height) + 1);
      } else {
        setTextureScaleRatioMux(1);
        setTextureScaleRatio(textureScaleRatio * textureScaleRatioMux);
      }
    }
  });

  const frameUseDrag = useDrag(({ down, movement }) => {
    if (dragMode === DRAG_MODES.SCALE_VIEW) {
      if (down) {
        setFaceScaleMux((movement[1] / screenDimensions.height) + 1);
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
      && textureTranslation && textureScaleRatioMuxed != null
      && textureRotation != null && textureApplicationSvgRef.current) {
      const ctx = textureCanvas.getContext('2d');
      const svgStr = `<svg viewBox="${
        viewBoxAttrsToString(viewBoxAttrs)}">${textureApplicationSvgRef.current.outerHTML}</svg>`;
      Canvg.from(ctx, svgStr, presets.offscreen()).then((v) => v.render());
    }
  }, [textureTranslation, textureScaleRatioMuxed, textureRotation, textureRotationDelta, shapeId]);

  if (!fileList || !screenDimensions || !viewBoxAttrs) { return null; }
  setTextureDFromFile();
  const TEXTURE_RANGE_MULT = 2;
  const textureScaleMax = textureFittingScale * TEXTURE_RANGE_MULT;
  const textureScaleMin = textureFittingScale / TEXTURE_RANGE_MULT;
  const textureScaleValue = textureScaleMin + (textureScaleMax - textureScaleMin) * textureScaleRatioMuxed;
  const textureCenterVector = imageDimensions ? [imageDimensions.width / 2, imageDimensions.height / 2] : [0, 0];

  const negateMap = (num) => num * -1;
  const textureTransformMatrixStr = (() => {
    const m = (new Matrix())
      .translate(...point(...textureTranslation).toArray())
      .scale(textureScaleValue, textureScaleValue)
      .translate(...textureCenterVector)
      .rotate(textureRotation + textureRotationDelta)
      .translate(...textureCenterVector.map(negateMap));
    return `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.tx} ${m.ty})`;
  })();

  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));
  const faceScaleMuxed = faceScaleMux * faceScale;
  const faceScalePercentStr = `${faceScaleMuxed * 100}%`;
  const faceScaleCenterPercentStr = `${((1 - faceScaleMuxed) * 100) / 2}%`;

  const sendTexture = async () => {
    setIsLoading(true);
    // return ReactDOMServer.renderToString(React.createElement(FaceBoundarySVG, { store: this }));
    const intersectionSvg = (
      <FaceIntersectionSVG
        boundaryD={path.getD()}
        textureD={texturePathD}
        textureTransform={textureTransformMatrixStr}
        isPositive
      />
    );
    const intersectionSvgStr = ReactDOMServer.renderToString(intersectionSvg);
    const dClipdSVG = await ipcRenderer.invoke('intersect-svg', intersectionSvgStr, isPositive);
    const dd = extractCutHolesFromSvgString(dClipdSVG);
    ipcRenderer.send('die>set-die-line-cut-holes', dd, textureTransformMatrixStr);
    setIsLoading(false);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...frameUseDrag()}>
        {isLoading && (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        )}
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview
            width={screenDimensions.width / 2}
            height={screenDimensions.height}
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
          <DragModeOptionsGroup dragMode={dragMode} setDragMode={setDragMode} />
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
