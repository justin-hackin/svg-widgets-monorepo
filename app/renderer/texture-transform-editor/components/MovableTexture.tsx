// @ts-nocheck
import React, {
  createRef, useEffect, useState,
} from 'react';
import { useDrag } from 'react-use-gesture';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import { Matrix, Polygon, Point } from '@flatten-js/core';

import { VERY_SMALL_NUMBER } from '../../die-line-viewer/util/geom';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { PanelSlider } from '../../die-line-viewer/components/inputs/PanelSlider';
import { extractCutHolesFromSvgString } from '../../die-line-viewer/util/svg';
import { PathData } from '../../die-line-viewer/util/PathData';
import { closedPolygonPath } from '../../die-line-viewer/util/shapes/generic';

export const theme = createMuiTheme(darkTheme);
const getFitScale = ({ width: boundsWidth, height: boundsHeight }, { width: imageWidth, height: imageHeight }) => {
  const widthIsClamp = (boundsWidth / boundsHeight) <= (imageWidth / imageHeight);
  return {
    widthIsClamp,
    scale: widthIsClamp ? boundsWidth / imageWidth : boundsHeight / imageHeight,
  };
};

const viewBoxAttrsToString = (vb) => `${vb.xmin} ${vb.ymin} ${vb.width} ${vb.height}`;

const MoveableTextureLOC = (props) => {
  const textureRef = createRef();

  const [screenDimensions, setScreenDimensions] = useState();
  // can't use early exit because image must render before it's onload sets imageDimensions
  const [imageDimensions, setImageDimensions] = useState({ width: 1, height: 1 });

  const [faceScaleRatio, setFaceScaleRatio] = useState(1);

  const [textureScaleRatio, setTextureScaleRatio] = useState(0.5);

  const [offsetRatio, setOffsetRatio] = useState(0);

  const [textureRotation, setTextureRotation] = useState(0);

  const [fileList, setFileList] = useState();

  const [fileIndex, setFileIndex] = useState();

  const [textureTranslation, setTextureTranslation] = useState([0, 0]);

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
      setBoundaryWithPoints(points.map((pt) => new Point(pt[0], pt[1])));
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

  const bind = useDrag(({ down, offset }) => {
    if (down) {
      setTextureTranslation(offset.map((value) => value));
    }
  });

  const { viewBoxAttrs, path } = boundary || {};
  if (!fileList || !screenDimensions || !viewBoxAttrs) { return null; }
  // slider component should enforce range and prevent tile from going outside bounds on change of window size
  const { widthIsClamp: faceWidthIsClamp, scale: faceFittingScale } = getFitScale(screenDimensions, viewBoxAttrs);
  const svgScale = faceScaleRatio * faceFittingScale;
  const { scale: textureFittingScale } = getFitScale(viewBoxAttrs, imageDimensions);
  const TEXTURE_RANGE_MULT = 2;
  const textureScaleMax = textureFittingScale * TEXTURE_RANGE_MULT;
  const textureScaleMin = textureFittingScale / TEXTURE_RANGE_MULT;
  const textureScaleValue = textureScaleMin + (textureScaleMax - textureScaleMin) * textureScaleRatio;
  const textureCenterVector = [imageDimensions.width / 2, imageDimensions.height / 2];

  const getTextureUrl = () => `/images/textures/${fileList[fileIndex]}`;
  const negateMap = (num) => num * -1;
  const getTransformMatrix = () => {
    const matrix = new Matrix();
    return matrix
      .translate(...textureTranslation.map((val) => val / svgScale))
      .scale(textureScaleValue, textureScaleValue)
      .translate(...textureCenterVector)
      .rotate(textureRotation)
      .translate(...textureCenterVector.map(negateMap));
  };
  const matrixToTransformString = (m) => `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.tx} ${m.ty})`;
  const getTextureDValue = async () => {
    const { current } = textureRef;
    if (!current) { return null; }
    const pathFragment = current.getAttribute('xlink:href');
    if (!pathFragment) { return null; }

    const svgString = await ipcRenderer.invoke('get-svg-string-by-path', getTextureUrl());

    const dee = extractCutHolesFromSvgString(svgString);
    console.log(dee);
    const texPath = PathData.fromDValue(dee);
    return texPath.transformPoints(getTransformMatrix()).getD();
  };


  const { classes } = props;
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;
  const { width: faceWidth, height: faceHeight } = viewBoxAttrs;

  const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));

  const offsetMargin = offsetRatio * faceFittingScale * viewBoxAttrs[faceWidthIsClamp ? 'width' : 'height'];

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        <div
          className="svg-container"
        >
          <svg
            className="root-svg"
            viewBox={viewBoxAttrsToString(viewBoxAttrs)}
            width={faceWidth}
            height={faceHeight}
            transform={`translate(${offsetMargin} ${offsetMargin}) scale(${svgScale})`}
            transform-origin="0 0"
            {...bind()}
          >
            <g>
              <path fill="#FFD900" stroke="#000" d={path.getD()} />
              <image
                transform={matrixToTransformString(getTransformMatrix())}
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
        </div>

        <div className={classes.select}>
          <FingerprintIcon onClick={async () => {
            const val = await getTextureDValue();
            ipcRenderer.send('die>set-die-line-cut-holes', val, faceWidth);
          }}
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
            label="View scale"
            value={faceScaleRatio}
            setter={setFaceScaleRatio}
            step={VERY_SMALL_NUMBER}
            max={1}
            min={0.3}
          />
          <PanelSlider
            label="Texture scale"
            value={textureScaleRatio}
            setter={setTextureScaleRatio}
            step={VERY_SMALL_NUMBER}
            max={2}
            min={0.1}
          />
          <PanelSlider
            label="Texture rotation"
            value={textureRotation}
            setter={setTextureRotation}
            step={VERY_SMALL_NUMBER}
            max={360}
            min={0}
          />
          <PanelSlider
            label="Offset"
            value={offsetRatio}
            setter={setOffsetRatio}
            step={VERY_SMALL_NUMBER}
            max={0.5}
            min={0}
          />
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
})(MoveableTextureLOC);
