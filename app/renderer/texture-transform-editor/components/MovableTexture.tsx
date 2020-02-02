// @ts-nocheck
import React, { Component } from 'react';
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
  return widthIsClamp ? boundsWidth / imageWidth : boundsHeight / imageHeight;
};

const viewBoxAttrsToString = (vb) => `${vb.xmin} ${vb.ymin} ${vb.width} ${vb.height}`;

class MoveableTextureLOC extends Component {
  constructor() {
    super();
    this.state = {
      boundaryPoints: null,
      boundaryViewBoxAttrs: null,
      boundaryPath: null,
      faceScaleRatio: 1,
    };

    this.textureRef = React.createRef();
    this.portalRef = React.createRef();
    this.backdropRef = React.createRef();
    this.outerSvgRef = React.createRef();

    this.setTransform = this.setTransform.bind(this);
    this.setFileIndex = this.setFileIndex.bind(this);
    this.setScreenDimensions = this.setScreenDimensions.bind(this);
  }

  async componentDidMount(): void {
    ipcRenderer.on('tex>update-face-outline', (e, points) => {
      this.setBoundaryPoints(points.map((pt) => new Point(pt[0], pt[1])));
    });
    ipcRenderer.send('die>request-boundary-points');

    window.onresize = () => {
      this.setScreenDimensions(window.outerWidth, window.outerHeight);
    };
    window.onresize();

    const fileList = await ipcRenderer.invoke('list-texture-files');
    this.setState({ fileList, selectedFileIndex: 0 });
  }

  setBoundaryPoints(boundaryPoints) {
    const poly = new Polygon();
    poly.addFace(boundaryPoints);
    const {
      xmin, ymin, xmax, ymax,
    } = poly.box;
    const boundaryViewBoxAttrs = {
      xmin, ymin, width: xmax - xmin, height: ymax - ymin,
    };
    this.setState({ boundaryPoints, boundaryViewBoxAttrs, boundaryPath: closedPolygonPath(boundaryPoints) });
  }

  setTransform(transform) {
    this.setState((state) => ({ transform: { ...state.transform, ...transform } }));
  }

  setFileIndex(selectedFileIndex) {
    this.setState({ selectedFileIndex: parseInt(selectedFileIndex, 10) });
  }

  setScreenDimensions(width, height) {
    this.setState({ screenDimensions: { width, height } });
  }

  getTextureUrl() {
    const { fileList, selectedFileIndex } = this.state;
    return `/images/textures/${fileList[selectedFileIndex]}`;
  }

  async getTextureDValue() {
    const { current } = this.textureRef;
    if (!current) { return null; }
    const pathFragment = current.getAttribute('xlink:href');
    if (!pathFragment) { return null; }

    const svgString = await ipcRenderer.invoke('get-svg-string-by-path', this.getTextureUrl());

    const { baseVal } = this.textureRef.current.cloneNode().transform;
    const consolidatedMatrix = baseVal.consolidate().matrix;
    const {
      a, b, c, d, e, f,
    } = consolidatedMatrix;
    const dee = extractCutHolesFromSvgString(svgString);
    console.log(dee);
    const path = PathData.fromDValue(dee);
    return path.transformPoints(new Matrix(a, b, c, d, e, f)).getD();
  }


  render() {
    const { classes } = this.props;
    const {
      state: {
        faceScaleRatio,
        fileList, selectedFileIndex,
        imageDimensions = {},
        screenDimensions,
        boundaryViewBoxAttrs,
        boundaryPath,
      },
    } = this;

    if (!fileList || !boundaryViewBoxAttrs) { return null; }

    const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;
    const { width: faceWidth, height: faceHeight } = boundaryViewBoxAttrs;

    // slider component should enforce range and prevent tile from going outside bounds on change of window size
    const textureFittingScale = getFitScale(boundaryViewBoxAttrs, imageDimensions);
    const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));
    return (
      <ThemeProvider theme={theme}>
        <Box className={classes.root}>
          {/*
              controls are rendered as HTML not SVG so
              we need to pass a ref to ReactMoveableSvgElement so it can render via portal here
          */}

          <svg
            className="root-svg"
            ref={this.outerSvgRef}
            viewBox={viewBoxAttrsToString(boundaryViewBoxAttrs)}
            transform={`scale(${faceScaleRatio})`}
          >
            <g>
              <path fill="#FFD900" stroke="#000" d={boundaryPath.getD()} />
              <image
                transform={Number.isNaN(textureFittingScale) ? null : `scale(${textureFittingScale})`}
                onLoad={() => {
                  // eslint-disable-next-line no-shadow
                  const { height, width } = this.textureRef.current.getBBox();
                  this.setState((prevState) => ({ ...prevState, imageDimensions: { height, width } }));
                  // the movable attempts to calculate the bounds before the image has loaded, hence below
                  // deferred by a tick so that style changes from above take effect beforehand
                }}
                ref={this.textureRef}
                // style={{ transformOrigin: `${imageWidth / 2}px ${imageHeight / 2}px` }}
                xlinkHref={this.getTextureUrl()}
              />
            </g>
          </svg>

          <div className={classes.select}>
            <FingerprintIcon onClick={async () => {
              const val = await this.getTextureDValue();
              ipcRenderer.send('die>set-die-line-cut-holes', val, faceWidth);
            }}
            />
            <PanelSelect
              label="Tile"
              value={selectedFileIndex}
              setter={this.setFileIndex}
              options={options}
            />
            <PanelSlider
              label="View scale"
              value={faceScaleRatio}
              setter={(val) => {
                this.setState({ faceScaleRatio: val });
              }}
              step={VERY_SMALL_NUMBER}
              max={1}
              min={0.3}
            />
          </div>
        </Box>
      </ThemeProvider>
    );
  }
}
export const MoveableTexture = withStyles({
  root: {
    backgroundColor: '#333', display: 'block', width: '100%', height: '100%', position: 'absolute', color: '#fff',
  },
  select: {
    display: 'flex', position: 'absolute', top: 0, right: 0,
  },
})(MoveableTextureLOC);
