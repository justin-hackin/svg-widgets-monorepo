import React from 'react';
import { useDrag, useGesture } from 'react-use-gesture';
import { inRange } from 'lodash';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { Box, Paper } from '@material-ui/core';
import { svgPathBbox } from 'svg-path-bbox';

// @ts-ignore
import { point, Polygon } from '@flatten-js/core';
import darkTheme from '../DielineViewer/data/material-ui-dark-theme.json';
import { closedPolygonPath } from '../DielineViewer/util/shapes/generic';
import { ShapePreview } from './components/ShapePreview';
import { DRAG_MODES, useDragMode } from './dragMode';
import { extractCutHolesFromSvgString } from '../DielineViewer/util/svg';
import { TextureSvg } from './components/TextureSvg';
import { PointTuple } from '../common/util/geom';
import { PathData } from '../DielineViewer/util/PathData';
import { TextureControls } from './components/TextureControls';
import { EVENTS } from '../../main/ipc';
import { viewBoxAttrsToString } from './util';
import {
  addTuple,
  calculateTransformOriginChangeOffset,
  getTextureTransformMatrix,
  matrixTupleTransformPoint,
  negateMap,
} from '../common/util/2d-transform';

interface DimensionsObject {
  width: number,
  height: number,
}

interface ViewBoxAttrs extends DimensionsObject {
  xmin: number,
  ymin:number
}

interface Boundary {
  viewBoxAttrs: ViewBoxAttrs,
  path: PathData,
  vertices: PointTuple[]
}

interface Texture {
  pathD: string,
  dimensions: DimensionsObject,
}

const {
  createRef, useEffect, useState,
} = React;


// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
// TODO: make router wrap with styles
// @ts-ignore
export const theme = createMuiTheme(darkTheme);
const getFitScale = (bounds: DimensionsObject, image: DimensionsObject) => {
  if (!bounds || !image) { return null; }
  const widthIsClamp = (bounds.width / bounds.height) <= (image.width / image.height);
  return {
    widthIsClamp,
    scale: widthIsClamp ? bounds.width / image.width : bounds.height / image.height,
  };
};

const getCoverScale = (bounds: DimensionsObject, image: DimensionsObject) => {
  if (!bounds || !image) { return null; }
  const widthScale = bounds.width / image.width;
  const heightScale = bounds.height / image.height;
  const widthIsClamp = widthScale >= heightScale;
  return {
    widthIsClamp,
    scale: widthIsClamp ? widthScale : heightScale,
  };
};

const TextureTransformEditorLOC = ({ classes }) => {
  const dragMode = useDragMode();

  const textureApplicationSvgRef = createRef<SVGElement>();

  const [isPositive, setIsPositive] = useState(true);

  const [placementAreaDimensions, setPlacementAreaDimensions] = useState<DimensionsObject>();

  const [faceScale, setFaceScale] = useState(1);
  const [faceScaleMux, setFaceScaleMux] = useState(1);
  const faceScaleDragged = faceScaleMux * faceScale;


  // since both controls and matrix function require degrees, use degrees as unit instead of radians
  const [textureRotation, setTextureRotationRaw] = useState<number>(0);
  const negativeMod = (n, m) => ((n % m) + m) % m;
  const wrapDegrees = (deg) => negativeMod(deg, 360);
  const setTextureRotation = (val) => {
    setTextureRotationRaw(wrapDegrees(val));
  };

  const [textureRotationDelta, setTextureRotationDeltaRaw] = useState<number>(0);
  const textureRotationDragged = textureRotation + textureRotationDelta;
  const setTextureRotationDelta = (val) => { setTextureRotationDeltaRaw(wrapDegrees(val)); };

  const [textureTranslation, setTextureTranslation] = useState<PointTuple>([0, 0]);
  const [textureTranslationDelta, setTextureTranslationDelta] = useState<PointTuple>([0, 0]);
  const textureTranslationDragged = addTuple(textureTranslation, textureTranslationDelta);

  const [transformOrigin, setTransformOrigin] = useState<PointTuple>([0, 0]);
  const [transformOriginDelta, setTransformOriginDelta] = useState<PointTuple>([0, 0]);
  const transformOriginDragged = addTuple(transformOrigin, transformOriginDelta);

  const [texture, setTextureRaw] = useState<Texture>();

  const [boundary, setBoundary] = useState<Boundary>();

  const { viewBoxAttrs, path, vertices } = boundary || {};
  const boundaryPathD = path ? path.getD() : null;

  const [shapeId, setShapeId] = useState();

  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { scale: faceFittingScale = 1 } = getFitScale(placementAreaDimensions, viewBoxAttrs) || {};
  const imageCoverScale = texture ? getCoverScale(
    viewBoxAttrs, texture.dimensions,
  ).scale : 1;
  const [textureScale, setTextureScale] = useState<number>(imageCoverScale);
  const [textureScaleMux, setTextureScaleMuxRaw] = useState<number>(1);
  const textureScaleDragged = textureScale * textureScaleMux;
  const MIN_SCALE = 0.1 * imageCoverScale;
  const MAX_SCALE = 5 * imageCoverScale;


  const setTextureScaleMux = (val) => {
    if (inRange(val * textureScale, MIN_SCALE, MAX_SCALE)) {
      setTextureScaleMuxRaw(val);
    }
  };

  const fitFaceToBounds = () => {
    setTextureScale(imageCoverScale);
  };

  const fitTextureToFace = (imgDimensions = texture.dimensions) => {
    if (!imgDimensions) { return; }
    if (!viewBoxAttrs) {
      throw new Error('Unexpected condition: imgDimensions defined but viewBoxAttrs undefined');
    }
    const { height, width, xmin } = viewBoxAttrs;
    const { scale: imgCoverScale, widthIsClamp: imgCoverWidthIsClamp } = getCoverScale(
      viewBoxAttrs, imgDimensions,
    ) || {};
    setTextureScale(imgCoverScale);
    setTextureTranslation(imgCoverWidthIsClamp
      ? [xmin, (height - (imgDimensions.height * imgCoverScale)) / 2]
      : [xmin + (width - (imgDimensions.width * imgCoverScale)) / 2, 0]);
  };

  const setTexture = (pathD, recenterPath = false) => {
    if (!pathD) { setTextureRaw(null); return; }
    const [xmin, ymin, xmax, ymax] = svgPathBbox(pathD);
    const dimensions = { width: xmax - xmin, height: ymax - ymin };
    setTextureRaw({ pathD, dimensions });
    if (recenterPath) {
      fitTextureToFace(dimensions);
    }
  };

  const setTextureDFromFile = async (url) => {
    const d = await globalThis.ipcRenderer
      .invoke(EVENTS.GET_SVG_STRING_BY_PATH, url)
      .then((svgString) => extractCutHolesFromSvgString(svgString));
    // TODO: error handling
    setTexture(d, true);
  };


  const absoluteMovementToSvg = (absCoords) => absCoords.map(
    (coord) => coord / (faceFittingScale * faceScaleDragged),
  );

  // eslint-disable-next-line max-len
  const absoluteToRelativeCoords = (absCoords: PointTuple):PointTuple => matrixTupleTransformPoint(
    ((new DOMMatrixReadOnly())
      .scale(textureScaleDragged, textureScaleDragged)
      .rotate(textureRotationDragged)
      .inverse()),
    absoluteMovementToSvg(absCoords),
  );

  const m = texture ? getTextureTransformMatrix(
    transformOriginDragged, textureScaleDragged, textureRotationDragged, textureTranslationDragged,
  ) : null;

  const textureTransformMatrixStr = m ? m.toString() : '';

  const repositionTextureWithOriginOverCorner = (vertexIndex) => {
    if (!m) { return; }
    const originAbsolute = matrixTupleTransformPoint(
      m, transformOrigin,
    );
    const delta = addTuple(originAbsolute, vertices[vertexIndex].map(negateMap)).map(negateMap);
    setTextureTranslation(addTuple(delta, textureTranslation));
  };

  const repositionOriginOverCorner = (vertexIndex) => {
    if (!m) { return; }
    const relVertex = matrixTupleTransformPoint(
      m.inverse(), vertices[vertexIndex],
    );
    const delta = addTuple(relVertex.map(negateMap), transformOrigin).map(negateMap);
    const newTransformOrigin = addTuple(delta, transformOrigin);
    setTransformOrigin(newTransformOrigin);
    setTextureTranslation(addTuple(
      textureTranslation,
      calculateTransformOriginChangeOffset(transformOrigin, newTransformOrigin,
        textureScaleDragged, textureRotationDragged, textureTranslationDragged).map(negateMap),
    ));
  };

  // Init
  useEffect(() => {
    globalThis.ipcRenderer.on(EVENTS.UPDATE_TEXTURE_EDITOR, (e, faceVertices, aShapeId, faceDecoration) => {
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
      setBoundary({ viewBoxAttrs, path: closedPolygonPath(points), vertices: faceVertices });
      if (faceDecoration) {
        const {
          scale, origin, translate, rotate, pathD, isPositive: faceDecorationIsPositive,
        } = faceDecoration;
        setIsPositive(faceDecorationIsPositive);
        setTextureRotation(rotate);
        setTextureScale(scale);
        setTextureTranslation(translate);
        setTransformOrigin(origin);
        setTexture(pathD);
      } else {
        fitFaceToBounds();
        setTexture(null);
      }
    });

    const resizeHandler = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setPlacementAreaDimensions({ width: width / 2, height });
    };

    window.addEventListener('resize', resizeHandler);

    setTimeout(() => {
      resizeHandler();
    });

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  const textureTranslationUseDrag = useDrag(({ movement, down }) => {
    // accommodates the scale of svg so that the texture stays under the mouse
    if (dragMode === DRAG_MODES.TRANSLATE) {
      if (down) {
        setTextureTranslationDelta(absoluteMovementToSvg(movement));
      } else {
        setTextureTranslation(textureTranslationDragged);
        setTextureTranslationDelta([0, 0]);
      }
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        setTextureRotationDelta((movement[1] / placementAreaDimensions.height) * 360);
      } else {
        setTextureRotation(textureRotationDragged);
        setTextureRotationDelta(0);
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        setTextureScaleMux((movement[1] / placementAreaDimensions.height) + 1);
      } else {
        setTextureScaleMux(1);
        setTextureScale(textureScaleDragged);
      }
    }
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down }) => {
    // accommodates the scale of svg so that the texture stays under the mouse
    const relDelta = absoluteToRelativeCoords(movement);
    if (down) {
      setTransformOriginDelta(relDelta);
    } else {
      const relativeDifference = calculateTransformOriginChangeOffset(
        transformOrigin, transformOriginDragged,
        textureScaleDragged, textureRotationDragged, textureTranslationDragged,
      );
      setTransformOrigin(transformOriginDragged);
      setTransformOriginDelta([0, 0]);
      setTextureTranslation(addTuple(textureTranslation, relativeDifference.map(negateMap)));
    }
  });

  const MIN_VIEW_SCALE = 0.3;
  const MAX_VIEW_SCALE = 3;
  // mouse wheel scale/rotate/zoom
  const viewUseWheel = useGesture({
    onWheel: ({ movement: [, y] }) => {
      const percentHeightDelta = (y / placementAreaDimensions.height);
      const newScaleViewMux = (percentHeightDelta + 1) * faceScaleMux;
      if (
        dragMode === DRAG_MODES.SCALE_VIEW
        && inRange(newScaleViewMux * faceScale, MIN_VIEW_SCALE, MAX_VIEW_SCALE)
      ) {
        setFaceScaleMux(newScaleViewMux);
      } else if (dragMode === DRAG_MODES.ROTATE) {
        setTextureRotationDelta(textureRotationDelta + percentHeightDelta * 90);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        setTextureScaleMux((percentHeightDelta + 1) * textureScaleMux);
      }
    },
    onWheelEnd: () => {
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        setFaceScale(faceScaleDragged);
        setFaceScaleMux(1);
      } else if (dragMode === DRAG_MODES.ROTATE) {
        setTextureRotation(textureRotationDragged);
        setTextureRotationDelta(0);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        setTextureScale(textureScaleDragged);
        setTextureScaleMux(1);
      }
    },
  });

  if (!placementAreaDimensions || !viewBoxAttrs) { return null; }
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const faceScalePercentStr = `${faceScaleDragged * 100}%`;
  const faceScaleCenterPercentStr = `${((1 - faceScaleDragged) * 100) / 2}%`;
  const sendTexture = async () => {
    if (!texture) { return; }
    const faceDecoration = {
      scale: textureScale,
      rotate: textureRotation,
      origin: transformOrigin,
      translate: textureTranslation,
      isPositive,
      pathD: texture.pathD,
    };
    globalThis.ipcRenderer.send(EVENTS.UPDATE_DIELINE_VIEWER, faceDecoration);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...viewUseWheel()}>
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview
            width={placementAreaDimensions.width}
            height={placementAreaDimensions.height}
            {...{
              viewBoxAttrs,
              shapeId,
              texturePathD: texture ? texture.pathD : '',
              boundaryPathD,
              textureTransformMatrixStr,
              transformOriginDragged,
              isPositive,
            }}
          />
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
                textureScale: textureScaleDragged,
                textureApplicationSvgRef,
                transformOriginDragged,
                texturePathD: texture ? texture.pathD : '',
                textureTransformMatrixStr,
                textureTranslationUseDrag,
                faceFittingScale,
                transformOriginUseDrag,
                isPositive,
              }}
            />
          </svg>
        </Paper>

        <TextureControls {...{
          classes,
          textureRotation,
          setTextureRotation,
          sendTexture,
          repositionTextureWithOriginOverCorner,
          repositionOriginOverCorner,
          setTextureDFromFile,
          isPositive,
          setIsPositive,
          dragMode,
        }}
        />
      </Box>
    </ThemeProvider>
  );
};

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
})(TextureTransformEditorLOC);
