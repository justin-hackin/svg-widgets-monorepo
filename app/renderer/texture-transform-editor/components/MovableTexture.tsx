// @ts-nocheck
import React, { Component } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Box } from '@material-ui/core';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import { Matrix } from '@flatten-js/core';

import { VERY_SMALL_NUMBER } from '../../die-line-viewer/util/geom';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { PanelSlider } from '../../die-line-viewer/components/inputs/PanelSlider';
import { extractCutHolesFromSvgString } from '../../die-line-viewer/util/svg';
import { PathData } from '../../die-line-viewer/util/PathData';
import { MoveableSvgGroup } from './MovableControls';

export const theme = createMuiTheme(darkTheme);
const tilePathRel = '/images/shape-templates/great-disdyakisdodecahedron__template__ink.svg';

class MoveableTextureLOC extends Component {
  constructor() {
    super();
    this.state = {
      keepRatio: true,
      faceScale: 3,
      renderToggle: false,
    };
    this.textureRef = React.createRef();
    this.portalRef = React.createRef();
    this.backdropRef = React.createRef();
    this.outerSvgRef = React.createRef();

    this.setTransform = this.setTransform.bind(this);
    this.setFileIndex = this.setFileIndex.bind(this);
    this.toggleKeepRatio = this.toggleKeepRatio.bind(this);
    this.setScreenDimensions = this.setScreenDimensions.bind(this);
  }

  async componentDidMount(): void {
    window.onresize = () => {
      this.setScreenDimensions(window.outerWidth, window.outerHeight);
      this.updateTextureRect();
    };
    window.onresize();

    const fileList = await ipcRenderer.invoke('list-texture-files');
    this.setState({ fileList, selectedFileIndex: 0 });
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
    const extraScale = this.outerSvgRef.current.createSVGTransform();
    const { faceScale } = this.state;
    extraScale.setScale(1 / faceScale, 1 / faceScale);
    baseVal.appendItem(extraScale);
    const consolidatedMatrix = baseVal.consolidate().matrix;
    const {
      a, b, c, d, e, f,
    } = consolidatedMatrix;
    const dee = extractCutHolesFromSvgString(svgString);
    console.log(dee);
    const path = PathData.fromDValue(dee);
    return path.transformPoints(new Matrix(a, b, c, d, e, f)).getD();
  }

  updateTextureRect() {
    // eslint-disable-next-line react/destructuring-assignment
    this.setState(({ renderToggle }) => ({ renderToggle: !renderToggle }));
  }

  toggleKeepRatio() {
    this.setState((state) => ({ keepRatio: !state.keepRatio }));
  }

  render() {
    const { classes } = this.props;
    const {
      state: {
        faceScale,
        fileList, selectedFileIndex, keepRatio,
        imageDimensions = {},
        faceDimensions: { height: faceHeight = 0, width: faceWidth = 0 } = {},
        screenDimensions: { height: screenHeight = 0, width: screenWidth = 0 } = {},
        renderToggle,
      },
    } = this;
    if (!fileList) { return null; }
    const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));

    return (
      <ThemeProvider theme={theme}>
        <Box className={classes.root}>
          <div className={classes.select}>
            <FingerprintIcon onClick={async () => {
              const val = await this.getTextureDValue();
              ipcRenderer.send('die>set-die-line-cut-holes', val, 162.49241760601677);
              // eslint-disable-next-line no-undef
              console.log('>>>>>', val);
            }}
            />
            <PanelSelect
              label="Tile"
              value={selectedFileIndex}
              setter={this.setFileIndex}
              options={options}
            />
            <FormControlLabel
              className={classes.checkboxControlLabel}
              control={(
                <Checkbox
                  checked={keepRatio}
                  onChange={this.toggleKeepRatio}
                  value="checkedB"
                  color="primary"
                />
              )}
              label="Preserve ratio"
            />
            <PanelSlider
              label="Face scale"
              value={faceScale}
              setter={(val) => {
                this.setState({ faceScale: val });
              }}
              step={VERY_SMALL_NUMBER}
              max={5}
              min={1}
            />
          </div>

          {/*
              controls are rendered as HTML not SVG so
              we need to pass a ref to ReactMoveableSvgElement so it can render via portal here
          */}
          <div className="controls-container" ref={this.portalRef} />

          <svg
            className="root-svg"
            width="100%"
            height="100%"
            ref={this.outerSvgRef}
            // transform={`translate(${
            //   (screenWidth - faceWidth * faceScale) / 2} ${(screenHeight - faceHeight * faceScale) / 2})`}
            // style={{ transformOrigin: '50% 50%' }}
          >
            <image
              transform={`scale(${faceScale} ${faceScale}) `}
              ref={this.backdropRef}
              onLoad={(e) => {
                // eslint-disable-next-line no-shadow
                const { height, width } = e.target.getBBox();
                this.setState({ faceDimensions: { height, width } });
              }}
              xlinkHref={tilePathRel}
            />
            <MoveableSvgGroup outerTransform={renderToggle} portalRef={this.portalRef}>
              <image
                {...imageDimensions}
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
            </MoveableSvgGroup>
          </svg>
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
