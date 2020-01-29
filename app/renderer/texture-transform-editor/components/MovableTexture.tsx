// @ts-nocheck
import React, { Component } from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Box } from '@material-ui/core';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import { Matrix } from '@flatten-js/core';

import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
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
      renderToggle: false,
    };
    this.textureRef = React.createRef();
    this.portalRef = React.createRef();
    this.backdropRef = React.createRef();
    this.outerSvgRef = React.createRef();

    this.setFileIndex = this.setFileIndex.bind(this);
    this.updateTextureRect = this.updateTextureRect.bind(this);
    this.toggleKeepRatio = this.toggleKeepRatio.bind(this);
  }

  async componentDidMount(): void {
    const fileList = await ipcRenderer.invoke('list-texture-files');
    this.setState({ fileList, selectedFileIndex: 0 });
  }

  setFileIndex(selectedFileIndex) {
    this.setState({ selectedFileIndex: parseInt(selectedFileIndex, 10) });
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
        fileList, selectedFileIndex, keepRatio,
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
          >
            <image
              ref={this.backdropRef}
              xlinkHref={tilePathRel}
            />
            <MoveableSvgGroup outerTransform={renderToggle} portalRef={this.portalRef}>
              <image
                ref={this.textureRef}
                onLoad={this.updateTextureRect}
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
