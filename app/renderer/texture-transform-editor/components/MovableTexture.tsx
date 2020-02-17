// @ts-nocheck
import React, {
  createRef, useEffect, useState,
} from 'react';
import { useDrag } from 'react-use-gesture';
import ReactDOMServer from 'react-dom/server';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import {
  Box, Checkbox, CircularProgress, FormControlLabel, IconButton,
} from '@material-ui/core';
import TelegramIcon from '@material-ui/icons/Telegram';

import { Matrix, Polygon, point } from '@flatten-js/core';
import { VERY_SMALL_NUMBER } from '../../die-line-viewer/util/geom';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { PanelSlider } from '../../die-line-viewer/components/inputs/PanelSlider';
import { extractCutHolesFromSvgString } from '../../die-line-viewer/util/svg';
import { closedPolygonPath } from '../../die-line-viewer/util/shapes/generic';


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

const degToRad = (deg) => (deg / 360) * Math.PI * 2;
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

const MoveableTextureLOC = (props) => {
  const textureRef = createRef();

  const [isLoading, setIsLoading] = useState(false);
  const [isPositive, setIsPositive] = useState(true);

  const [screenDimensions, setScreenDimensions] = useState();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState();

  const [faceScalePercent, setFaceScalePercent] = useState(80);

  const [textureScaleRatio, setTextureScaleRatio] = useState(0.5);

  const [textureRotation, setTextureRotation] = useState(0);

  const [fileList, setFileList] = useState();

  const [fileIndex, setFileIndex] = useState();

  // due to scaling of view in between drags, must maintain active translation and apply when drag released
  const [textureTranslation, setTextureTranslation] = useState([0, 0]);
  const [textureDragTranslation, setTextureDragTranslation] = useState([0, 0]);

  const [boundary, setBoundary] = useState();

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
    ipcRenderer.on('tex>update-face-outline', (e, points) => {
      setBoundaryWithPoints(points.map((pt) => point(pt[0], pt[1])));
    });
    ipcRenderer.send('die>request-boundary-points');

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
    (coord) => ((coord * 100) / faceScalePercent) / faceFittingScale,
  );
  const bind = useDrag(({ down, movement }) => {
    const relativeMovement = point(absoluteMovementToSvg(movement));
    if (down) {
      setTextureDragTranslation(relativeMovement.toArray());
    } else {
      setTextureDragTranslation([0, 0]);
      setTextureTranslation(
        relativeMovement
          .add(point(...textureTranslation))
          .toArray(),
      );
    }
  });
  if (!fileList || !screenDimensions || !viewBoxAttrs) { return null; }
  const TEXTURE_RANGE_MULT = 2;
  const textureScaleMax = textureFittingScale * TEXTURE_RANGE_MULT;
  const textureScaleMin = textureFittingScale / TEXTURE_RANGE_MULT;
  const textureScaleValue = textureScaleMin + (textureScaleMax - textureScaleMin) * textureScaleRatio;
  const textureCenterVector = imageDimensions ? [imageDimensions.width / 2, imageDimensions.height / 2] : [0, 0];

  const getTextureUrl = () => `/images/textures/${fileList[fileIndex]}`;
  const negateMap = (num) => num * -1;
  const getTransformMatrix = () => {
    const matrix = new Matrix();
    return matrix
      .translate(...point(...textureTranslation).add(point(...textureDragTranslation)).toArray())
      .scale(textureScaleValue, textureScaleValue)
      .translate(...textureCenterVector)
      .rotate(degToRad(textureRotation))
      .translate(...textureCenterVector.map(negateMap));
  };
  const matrixToTransformString = (m) => `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.tx} ${m.ty})`;

  const getTextureDValue = async () => {
    const { current } = textureRef;
    if (!current) { return null; }
    const pathFragment = current.getAttribute('xlink:href');
    if (!pathFragment) { return null; }

    const svgString = await ipcRenderer.invoke('get-svg-string-by-path', getTextureUrl());

    return extractCutHolesFromSvgString(svgString);
  };


  const { classes } = props;
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));
  const faceScalePercentStr = `${faceScalePercent}%`;
  const faceScaleCenterPercentStr = `${(100 - faceScalePercent) / 2}%`;
  const imageTransform = matrixToTransformString(getTransformMatrix());

  const sendTexture = async () => {
    setIsLoading(true);
    const d = await getTextureDValue();
    // return ReactDOMServer.renderToString(React.createElement(FaceBoundarySVG, { store: this }));
    const intersectionSvg = (
      <FaceIntersectionSVG
        boundaryD={path.getD()}
        textureD={d}
        textureTransform={imageTransform}
        isPositive
      />
    );
    const intersectionSvgStr = ReactDOMServer.renderToString(intersectionSvg);
    const dClipdSVG = await ipcRenderer.invoke('intersect-svg', intersectionSvgStr, isPositive);
    const dd = extractCutHolesFromSvgString(dClipdSVG);
    ipcRenderer.send('die>set-die-line-cut-holes', dd, matrixToTransformString(getTransformMatrix()));
    setIsLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        {isLoading && (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        )}
        <svg
          className="svg-container"
          width="100%"
          height="100%"
        >
          <svg
            x={faceScaleCenterPercentStr}
            y={faceScaleCenterPercentStr}
            width={faceScalePercentStr}
            height={faceScalePercentStr}
            className="root-svg"
            viewBox={viewBoxAttrsToString(viewBoxAttrs)}
          >
            <g>
              <path
                fill="#FFD900"
                stroke="#000"
                d={path.getD()}
              />
              <image
                transform={imageTransform}
                stroke="#f00"
                {...bind()}
                x={0}
                y={0}
                {...imageDimensions}
                onLoad={() => {
                  // eslint-disable-next-line no-shadow
                  const { height, width } = textureRef.current.getBBox();
                  setImageDimensions({ height, width });
                  // the movable attempts to calculate the bounds before the image has loaded, hence below
                  // deferred by a tick so that style changes from above take effect beforehand
                }}
                ref={textureRef}
                xlinkHref={getTextureUrl()}

              />
            </g>
          </svg>
        </svg>

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
          <PanelSlider
            label="Face scale %"
            value={faceScalePercent}
            setter={setFaceScalePercent}
            step={VERY_SMALL_NUMBER}
            max={100}
            min={30}
          />
          <PanelSlider
            label="Texture scale ratio"
            value={textureScaleRatio}
            setter={setTextureScaleRatio}
            step={VERY_SMALL_NUMBER}
            max={2}
            min={0.1}
          />
          <PanelSlider
            label="Texture rotation °"
            value={textureRotation}
            setter={setTextureRotation}
            step={VERY_SMALL_NUMBER}
            max={360}
            min={0}
          />
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
