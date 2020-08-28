import Canvg, { presets } from 'canvg';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { useDrag, useGesture } from 'react-use-gesture';
import { inRange } from 'lodash';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { Box, Paper } from '@material-ui/core';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';

// @ts-ignore
import { point, Polygon } from '@flatten-js/core';
import darkTheme from '../DielineViewer/data/material-ui-dark-theme.json';
import { closedPolygonPath } from '../DielineViewer/util/shapes/generic';
import { ShapePreview } from './components/ShapePreview';
import { DRAG_MODES, useDragMode } from './dragMode';
import { extractCutHolesFromSvgString } from '../DielineViewer/util/svg';
import { TextureSvg } from './components/TextureSvg';
import { PointTuple } from '../DielineViewer/util/geom';
import { PathData } from '../DielineViewer/util/PathData';
import { TextureControls } from './components/TextureControls';
import { EVENTS } from '../../main/ipc';

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

const {
  createRef, useRef, useEffect, useState,
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

const viewBoxAttrsToString = (vb) => `${vb.xmin} ${vb.ymin} ${vb.width} ${vb.height}`;

const matrixTupleTransformPoint = (matrix: DOMMatrixReadOnly, tuple: PointTuple): PointTuple => {
  const domPoint = matrix.transformPoint(new DOMPoint(...tuple));
  return [domPoint.x, domPoint.y];
};

const addTuple = ([ax, ay]: PointTuple, [bx, by]:PointTuple):PointTuple => [ax + bx, ay + by];

const negateMap = (num) => num * -1;


const TextureTransformEditorLOC = ({ classes }) => {
  const dragMode = useDragMode();

  const textureRef = createRef<SVGGraphicsElement>();
  const textureApplicationSvgRef = createRef<SVGElement>();
  const textureSvgRef = createRef<SVGSVGElement>();

  const textureCanvas = useRef<OffscreenCanvas>();

  const [isPositive, setIsPositive] = useState(true);

  const [placementAreaDimensions, setPlacementAreaDimensions] = useState<DimensionsObject>();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState<DimensionsObject>();

  const [faceScale, setFaceScale] = useState(1);
  const [faceScaleMux, setFaceScaleMux] = useState(1);
  const faceScaleDragged = faceScaleMux * faceScale;

  const [textureScale, setTextureScale] = useState<number>(1);
  const [textureScaleMux, setTextureScaleMuxRaw] = useState<number>(1);
  const textureScaleDragged = textureScale * textureScaleMux;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;

  const setTextureScaleMux = (val) => {
    if (inRange(val * textureScale, MIN_SCALE, MAX_SCALE)) {
      setTextureScaleMuxRaw(val);
    }
  };

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

  const FILE_UNSELECTED_VALUE = '';
  const [fileList, setFileList] = useState<string[]>();
  const [fileIndex, setFileIndex] = useState<string>(FILE_UNSELECTED_VALUE);
  const [textureUrl, setTextureUrl] = useState<string>();
  const [texturePathD, setTexturePathD] = useState<string>();

  const [boundary, setBoundary] = useState<Boundary>();

  const { viewBoxAttrs, path, vertices } = boundary || {};
  const boundaryPathD = path ? path.getD() : null;

  const [shapeId, setShapeId] = useState();
  const [changeRenderFlag, setChangeRenderFlag] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { scale: faceFittingScale = 1 } = getFitScale(placementAreaDimensions, viewBoxAttrs) || {};
  const { scale: imageFittingScale = 1 } = getFitScale(placementAreaDimensions, imageDimensions) || {};
  const textureScaleValue = (textureScaleDragged * imageFittingScale) / faceFittingScale;


  const absoluteMovementToSvg = (absCoords) => absCoords.map(
    (coord) => coord / (faceFittingScale * faceScaleDragged),
  );

  // eslint-disable-next-line max-len
  const absoluteToRelativeCoords = (absCoords: PointTuple):PointTuple => matrixTupleTransformPoint(
    ((new DOMMatrixReadOnly())
      .scale(textureScaleValue, textureScaleValue)
      .rotate(textureRotationDragged)
      .inverse()),
    absoluteMovementToSvg(absCoords),
  );

  const matrixWithTransformCenter = (origin) => (new DOMMatrixReadOnly())
    .translate(...origin)
    .scale(textureScaleValue, textureScaleValue)
    .rotate(textureRotationDragged)
    .translate(...origin.map(negateMap));

  const calculateTransformOriginChangeOffset = (newTransformOrigin) => {
    const newMatrix = matrixWithTransformCenter(newTransformOrigin);
    const oldMatrix = matrixWithTransformCenter(transformOrigin);
    return addTuple(
      matrixTupleTransformPoint(newMatrix, textureTranslation),
      matrixTupleTransformPoint(oldMatrix, textureTranslation).map(negateMap),
    );
  };


  const m = (new DOMMatrixReadOnly())
    .translate(...textureTranslationDragged)
    .multiply(matrixWithTransformCenter(transformOrigin));

  const textureTransformMatrixStr = `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`;


  const repositionTextureWithOriginOverCorner = (vertexIndex) => {
    const originAbsolute = matrixTupleTransformPoint(
      m, transformOrigin,
    );
    const delta = addTuple(originAbsolute, vertices[vertexIndex].map(negateMap)).map(negateMap);
    setTextureTranslation(addTuple(delta, textureTranslation));
  };

  const repositionOriginOverCorner = (vertexIndex) => {
    const relVertex = matrixTupleTransformPoint(
      m.inverse(), vertices[vertexIndex],
    );
    const delta = addTuple(relVertex.map(negateMap), transformOrigin).map(negateMap);
    const newTransformOrigin = addTuple(delta, transformOrigin);
    setTransformOrigin(newTransformOrigin);
    setTextureTranslation(addTuple(
      textureTranslation,
      calculateTransformOriginChangeOffset(newTransformOrigin).map(negateMap),
    ));
  };

  const setTextureDFromFile = (url) => {
    globalThis.ipcRenderer.invoke(EVENTS.GET_SVG_STRING_BY_PATH, url)
      .then((svgString) => {
        setTexturePathD(extractCutHolesFromSvgString(svgString));
      });
  };

  // Init
  useEffect(() => {
    globalThis.ipcRenderer.on(EVENTS.SHAPE_UPDATE, (e, faceVertices, aShapeId) => {
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
      setTimeout(() => {
        setBoundary({ viewBoxAttrs, path: closedPolygonPath(points), vertices: faceVertices });
      });
    });

    const resizeHandler = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setPlacementAreaDimensions({ width: width / 2, height });
    };

    window.addEventListener('resize', resizeHandler);

    setTimeout(() => {
      resizeHandler();
    });

    globalThis.ipcRenderer.invoke(EVENTS.LIST_TEXTURE_FILES).then((list:string[]) => {
      setFileList(list);
      setTimeout(() => { setFileIndex('0'); }, 1000);
    });

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    if (imageDimensions && viewBoxAttrs) {
      const { height, xmin } = viewBoxAttrs;
      // the boundary update will trigger the offscreen canvas which will flip the changeRenderFlag
      // that happens too early on first render
      // TODO: make shape preview request canvas update when ready instead
      setTimeout(() => {
        setTransformOrigin([imageDimensions.width / 2, imageDimensions.height / 2]);
        setTextureTranslation([xmin, (height - (imageDimensions.height * textureScaleValue)) / 2]);
      }, 100);
    }
  }, [viewBoxAttrs, imageDimensions]);

  useEffect(() => {
    const dragOver: any = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const dragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const dragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const drop: EventListener = (event:DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
      const { dataTransfer: { files } = {} } = event;

      if (files.length > 1) {
        // eslint-disable-next-line no-alert
        alert('Whoa there, only one file at a time in the Texture Fitting zone please');
      } else {
        setTextureDFromFile(files[0].path);
        setFileIndex(FILE_UNSELECTED_VALUE);
      }
    };

    if (textureSvgRef.current) {
      textureSvgRef.current.addEventListener('drop', drop, false);
      textureSvgRef.current.addEventListener('dragover', dragOver, false);
      textureSvgRef.current.addEventListener('dragenter', dragEnter, false);
      textureSvgRef.current.addEventListener('dragleave', dragLeave, false);
    }

    return () => {
      if (textureSvgRef.current) {
        textureSvgRef.current.removeEventListener('drop', drop);
        textureSvgRef.current.removeEventListener('dragover', dragOver);
        textureSvgRef.current.removeEventListener('dragenter', dragEnter);
        textureSvgRef.current.removeEventListener('dragleave', dragLeave);
      }
    };
  }, [textureSvgRef]);


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
      const relativeDifference = calculateTransformOriginChangeOffset(transformOriginDragged);
      setTransformOrigin(transformOriginDragged);
      setTransformOriginDelta([0, 0]);
      setTextureTranslation(addTuple(textureTranslation, relativeDifference.map(negateMap)));
    }
  });

  const MIN_VIEW_SCALE = 0.3;
  const MAX_VIEW_SCALE = 3;
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

  // update texture path d-value when textureUrl changes
  useEffect(() => {
    if (textureUrl) {
      setTextureDFromFile(textureUrl);
    }
  }, [textureUrl]);

  useEffect(() => {
    // eslint-disable-next-line eqeqeq
    if (textureRef.current && fileIndex !== null && fileList && fileList[fileIndex]) {
      // @ts-ignore
      setTextureUrl(`${__static}/images/textures/${fileList[fileIndex]}`);
    }
  }, [textureRef.current, fileIndex, fileList]);

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
      // @ts-ignore
      const svgInnerContent = ReactDOMServer.renderToString(React.createElement(TextureSvg, {
        texturePathD, boundaryPathD, textureTransformMatrixStr, transformOriginDragged, isPositive,
      }));
      const svgStr = `<svg viewBox="${
        viewBoxAttrsToString(viewBoxAttrs)}">${svgInnerContent}</svg>`;
      Canvg.from(ctx, svgStr, presets.offscreen()).then(async (v) => {
        await v.render();
        setChangeRenderFlag(!changeRenderFlag);
      });
    }
  }, [textureCanvas.current, viewBoxAttrs, textureTransformMatrixStr, imageDimensions, isPositive]);

  if (!fileList || !placementAreaDimensions || !viewBoxAttrs || !textureTransformMatrixStr) { return null; }


  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const textureOptions = fileList.map((item, index) => ({ label: item, value: `${index}` }));
  const faceScalePercentStr = `${faceScaleDragged * 100}%`;
  const faceScaleCenterPercentStr = `${((1 - faceScaleDragged) * 100) / 2}%`;
  const sendTexture = async () => {
    const dd = await globalThis.ipcRenderer.invoke(
      EVENTS.INTERSECT_SVG, boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive,
    );
    globalThis.ipcRenderer.send(EVENTS.SET_DIELINE_CUT_HOLES, dd, textureTransformMatrixStr);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root} {...viewUseWheel()}>
        {isDragOver && (
          <div className={classes.loadingContainer}>
            <SystemUpdateIcon />
          </div>
        )}
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
            ref={textureSvgRef}
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
                transformOriginDragged,
                texturePathD,
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
          textureOptions,
          textureRotation,
          setTextureRotation,
          sendTexture,
          repositionTextureWithOriginOverCorner,
          repositionOriginOverCorner,
          isPositive,
          setIsPositive,
          fileIndex,
          setFileIndex,
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
