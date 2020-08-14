// @ts-nocheck
import Canvg, { presets } from 'canvg';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useDrag, useWheel } from 'react-use-gesture';
import { inRange } from 'lodash';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import {
  Box, Checkbox, FormControlLabel, IconButton, Paper,
} from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import { point, Polygon } from '@flatten-js/core';
import { PanelSelect } from '../../../common/components/PanelSelect';
import darkTheme from '../../../die-line-viewer/data/material-ui-dark-theme.json';
import { closedPolygonPath } from '../../../die-line-viewer/util/shapes/generic';
import { ShapePreview } from './components/ShapePreview';
import { DragModeOptionsGroup } from './components/DragModeOptionGroup';
import { DRAG_MODES, useDragMode } from './dragMode';
import { extractCutHolesFromSvgString } from '../../../die-line-viewer/util/svg';

const {
  createRef, useRef, useEffect, useState,
} = React;
// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin

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

const addTuple = ([ax, ay], [bx, by]) => [ax + bx, ay + by];

const CENTER_MARKER_RADIUS = 45;
const CENTER_MARKER_STROKE = 2;
const HOLES_COLOR = '#000';
const MATERIAL_COLOR = '#FFD900';
const TextureSvg = ({
  showCenterMarker,
  transformOriginMarkerPos,
  boundaryPathD,
  texturePathD,
  textureTransformMatrixStr,
  textureScaleValue,
  textureRef,
  textureTranslationUseDrag,
  transformOriginUseDrag,
  isPositive,
}) => (
  <svg overflow="visible">
    <path fill={isPositive ? HOLES_COLOR : MATERIAL_COLOR} d={boundaryPathD} />
    <g transform={textureTransformMatrixStr}>
      <path
        pointerEvents="bounding-box"
        ref={textureRef}
        {...(showCenterMarker && textureTranslationUseDrag())}
        fill={isPositive ? MATERIAL_COLOR : HOLES_COLOR}
        d={texturePathD}
      />
      {showCenterMarker && (
      <g {...transformOriginUseDrag()}>
        <circle
          r={CENTER_MARKER_RADIUS / textureScaleValue}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="rgba(255, 0, 0, 0.7)"
          strokeWidth={CENTER_MARKER_STROKE / textureScaleValue}
          cx={transformOriginMarkerPos[0]}
          cy={transformOriginMarkerPos[1]}
        />
        <circle
          r={(0.15 * CENTER_MARKER_RADIUS) / textureScaleValue}
          fill="rgba(255, 0, 0, 0.7)"
          stroke="black"
          strokeWidth={CENTER_MARKER_STROKE / textureScaleValue}
          cx={transformOriginMarkerPos[0]}
          cy={transformOriginMarkerPos[1]}
        />
      </g>
      )}
    </g>
  </svg>
);


const MoveableTextureLOC = ({ classes }) => {
  const dragMode = useDragMode();

  const textureRef = createRef();
  const textureApplicationSvgRef = createRef();
  const textureCanvas = useRef();

  const [isPositive, setIsPositive] = useState(true);

  const [placementAreaDimensions, setPlacementAreaDimensions] = useState();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState();


  const [faceScale, setFaceScale] = useState(1);
  const [faceScaleMux, setFaceScaleMux] = useState(1);
  const faceScaleMuxed = faceScaleMux * faceScale;


  const [textureScale, setTextureScale] = useState(1);
  const [textureScaleMux, setTextureScaleMux] = useState(1);

  const [textureRotation, setTextureRotation] = useState(0);
  const [textureRotationDelta, setTextureRotationDelta] = useState(0);

  const [textureTranslation, setTextureTranslation] = useState([0, 0]);

  const [transformOrigin, setTransformOrigin] = useState([0, 0]);
  const [transformOriginDelta, setTransformOriginDelta] = useState([0, 0]);
  const transformOriginMarkerPos = addTuple(transformOrigin, transformOriginDelta);

  const [fileList, setFileList] = useState();
  const [fileIndex, setFileIndex] = useState();
  const textureUrl = (fileList && fileIndex != null) ? `/images/textures/${fileList[fileIndex]}` : null;
  const [texturePathD, setTexturePathD] = useState();

  const [boundary, setBoundary] = useState();
  const { viewBoxAttrs, path } = boundary || {};
  const boundaryPathD = path ? path.getD() : null;

  const [shapeId, setShapeId] = useState();
  const [changeRenderFlag, setChangeRenderFlag] = useState(false);

  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { scale: faceFittingScale = 1 } = getFitScale(placementAreaDimensions, viewBoxAttrs) || {};
  const { scale: imageFittingScale = 1 } = getFitScale(placementAreaDimensions, imageDimensions) || {};
  const textureScaleValue = (textureScaleMux * textureScale * imageFittingScale) / faceFittingScale;


  const negateMap = (num) => num * -1;
  const m = (new DOMMatrixReadOnly())
    .translate(...textureTranslation)
    .translate(...transformOrigin)
    .scale(textureScaleValue, textureScaleValue)
    .rotate(textureRotation + textureRotationDelta)
    .translate(...transformOrigin.map(negateMap));
  const textureTransformMatrixStr = `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`;


  // Init
  useEffect(() => {
    ipcRenderer.on('tex>shape-update', (e, faceVertices, aShapeId) => {
      setShapeId(aShapeId);
      const points = faceVertices.map((vert) => point(...vert));
      const poly = new Polygon();
      poly.addFace(points);
      const {
        xmin, ymin, xmax, ymax,
      } = poly.box;
      // eslint-disable-next-line no-shadow
      const width = xmax - xmin;
      const height = ymax - ymin;
      // eslint-disable-next-line no-shadow
      const viewBoxAttrs = {
        xmin, ymin, width, height,
      };
      textureCanvas.current = new window.OffscreenCanvas(width, height);
      setBoundary({ viewBoxAttrs, path: closedPolygonPath(points) });
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

  useEffect(() => {
    if (imageDimensions && viewBoxAttrs) {
      const { height, xmin } = viewBoxAttrs;
      // the boundary update will trigger the offscreen canvas which will flip the changeRenderFlag
      // that happens too early on first render
      // TODO: make shape preview request canvas update when ready instead
      setTimeout(() => {
        setTextureTranslation([xmin, (height - (imageDimensions.height * textureScaleValue)) / 2]);
      }, 100);
    }
  }, [viewBoxAttrs, imageDimensions]);


  const matrixTupleTransformPoint = (matrix, tuple) => {
    const domPoint = matrix.transformPoint(new DOMPoint(...tuple));
    return [domPoint.x, domPoint.y];
  };

  const absoluteMovementToSvg = (absCoords) => absCoords.map(
    (coord) => coord / (faceFittingScale * faceScaleMuxed),
  );

  // eslint-disable-next-line max-len
  const absoluteToRelativeCoords = (absCoords) => matrixTupleTransformPoint(
    ((new DOMMatrixReadOnly())
      .scale(textureScaleValue, textureScaleValue)
      .rotate(textureRotation + textureRotationDelta)
      .inverse()),
    absoluteMovementToSvg(absCoords),
  );

  const matrixWithTransformCenter = (transformOrigin) => (new DOMMatrixReadOnly())
    .translate(...transformOrigin)
    .scale(textureScaleValue, textureScaleValue)
    .rotate(textureRotation + textureRotationDelta)
    .translate(...transformOrigin.map(negateMap));

  const textureTranslationUseDrag = useDrag(({ delta }) => {
    // accomodates the scale of svg so that the texture stays under the mouse
    setTextureTranslation(addTuple(absoluteMovementToSvg(delta), textureTranslation));
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down }) => {
    // accomodates the scale of svg so that the texture stays under the mouse
    const relDelta = absoluteToRelativeCoords(movement);
    if (down) {
      setTransformOriginDelta(relDelta);
    } else {
      const newMatrix = matrixWithTransformCenter(transformOriginMarkerPos);
      const oldMatrix = matrixWithTransformCenter(transformOrigin);
      const relativeDifference = addTuple(
        matrixTupleTransformPoint(newMatrix, textureTranslation),
        matrixTupleTransformPoint(oldMatrix, textureTranslation).map(negateMap),
      );
      setTransformOrigin(transformOriginMarkerPos);
      setTransformOriginDelta([0, 0]);
      setTextureTranslation(addTuple(textureTranslation, relativeDifference.map(negateMap)));
    }
  });

  const MIN_VIEW_SCALE = 0.3;
  const MAX_VIEW_SCALE = 3;
  const rotateSpeed = 8;
  const viewUseWheel = useWheel(({ movement: [, y] }) => {
    const percentHeightDelta = (y / placementAreaDimensions.height);
    const newScaleViewMux = (percentHeightDelta + 1) * faceScaleMux;
    if (
      dragMode === DRAG_MODES.SCALE_VIEW
      && inRange(newScaleViewMux * faceScale, MIN_VIEW_SCALE, MAX_VIEW_SCALE)
    ) {
      setFaceScaleMux(newScaleViewMux);
    } else if (dragMode === DRAG_MODES.ROTATE) {
      setTextureRotationDelta(textureRotationDelta + (percentHeightDelta * Math.PI * rotateSpeed));
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      setTextureScaleMux((percentHeightDelta + 1) * textureScaleMux);
    }
  }, {
    onWheelEnd: () => {
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        setFaceScale(faceScaleMux * faceScale);
        setFaceScaleMux(1);
      } else if (dragMode === DRAG_MODES.ROTATE) {
        setTextureRotationDelta(0);
        setTextureRotation(textureRotation + textureRotationDelta);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        setTextureScale(textureScaleMux * textureScale);
        setTextureScaleMux(1);
      }
    },
  });

  const setTextureDFromFile = () => {
    ipcRenderer.invoke('get-svg-string-by-path', textureUrl)
      .then((svgString) => {
        setTexturePathD(extractCutHolesFromSvgString(svgString));
      });
  };

  // update texture path d-value when textureUrl changes
  useEffect(() => {
    if (textureRef.current && textureUrl) {
      setTextureDFromFile();
    }
  }, [textureRef.current, textureUrl]);

  // update image dimensions when the image changes
  useEffect(() => {
    if (textureRef.current) {
      const bb = textureRef.current.getBBox();
      setImageDimensions({ width: bb.width, height: bb.height });
    }
  }, [texturePathD]);

  // when texture boundary or texture changes, recenter texture and
  // update offscreen canvas to match aspect of boundary
  useEffect(() => {
    if (textureCanvas.current && viewBoxAttrs && textureTransformMatrixStr && imageDimensions) {
      const ctx = textureCanvas.current.getContext('2d');
      const svgInnerContent = ReactDOMServer.renderToString(React.createElement(TextureSvg, {
        texturePathD, boundaryPathD, textureTransformMatrixStr, transformOriginMarkerPos, isPositive,
      }));
      const svgStr = `<svg viewBox="${
        viewBoxAttrsToString(viewBoxAttrs)}">${svgInnerContent}</svg>`;
      Canvg.from(ctx, svgStr, presets.offscreen()).then((v) => {
        v.render();
        setChangeRenderFlag(!changeRenderFlag);
      });
    }
  }, [textureCanvas.current, viewBoxAttrs, textureTransformMatrixStr, imageDimensions, isPositive]);

  if (!fileList || !placementAreaDimensions || !viewBoxAttrs || !textureTransformMatrixStr) { return null; }
  setTextureDFromFile();

  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));
  const faceScalePercentStr = `${faceScaleMuxed * 100}%`;
  const faceScaleCenterPercentStr = `${((1 - faceScaleMuxed) * 100) / 2}%`;
  const sendTexture = async () => {
    const dd = await ipcRenderer.invoke(
      'intersect-svg', boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive,
    );
    ipcRenderer.send('die>set-die-line-cut-holes', dd, textureTransformMatrixStr);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...viewUseWheel()}>
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview
            width={placementAreaDimensions.width}
            height={placementAreaDimensions.height}
            changeRenderFlag={changeRenderFlag}
            textureCanvas={textureCanvas.current}
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
            <TextureSvg
              showCenterMarker
              {...{
                boundaryPathD,
                textureRef,
                textureScaleValue,
                textureApplicationSvgRef,
                transformOriginMarkerPos,
                texturePathD,
                textureTransformMatrixStr,
                textureTranslationUseDrag,
                transformOriginUseDrag,
                isPositive,
              }}
            />
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
