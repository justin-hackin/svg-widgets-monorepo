// @ts-nocheck
import React, { Component } from 'react';
import Moveable from 'react-moveable';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme, withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Box } from '@material-ui/core';

import { VERY_SMALL_NUMBER } from '../../die-line-viewer/util/geom';
import { PanelSelect } from '../../die-line-viewer/components/inputs/PanelSelect';
import darkTheme from '../../die-line-viewer/data/material-ui-dark-theme.json';
import { PanelSlider } from '../../die-line-viewer/components/inputs/PanelSlider';

export const theme = createMuiTheme(darkTheme);

class MoveableTextureLOC extends Component {
  constructor() {
    super();
    this.state = {
      keepRatio: true,
      transform: {
        scaleX: 0.5, scaleY: 0.5, translateX: 0, translateY: 0, rotate: 0,
      },
      faceScale: 3,
    };
    this.textureRef = React.createRef();
    this.moveableRef = React.createRef();
    this.backdropRef = React.createRef();

    this.setTransform = this.setTransform.bind(this);
    this.setFileIndex = this.setFileIndex.bind(this);
    this.toggleKeepRatio = this.toggleKeepRatio.bind(this);
    this.setScreenDimensions = this.setScreenDimensions.bind(this);
  }

  async componentDidMount(): void {
    window.onresize = () => {
      this.setScreenDimensions(window.outerWidth, window.outerHeight);
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

  toggleKeepRatio() {
    this.setState((state) => ({ keepRatio: !state.keepRatio }));
  }

  setScreenDimensions(width, height) {
    this.setState({ screenDimensions: { width, height } });
  }

  render() {
    const { classes } = this.props;
    const {
      state: {
        faceScale,
        transform, fileList, selectedFileIndex, keepRatio,
        imageDimensions: { height: imageHeight = 0, width: imageWidth = 0 } = {},
        faceDimensions: { height: faceHeight = 0, width: faceWidth = 0 } = {},
        screenDimensions: { height: screenHeight = 0, width: screenWidth = 0 } = {},
      },
    } = this;
    if (!fileList) { return null; }
    const fileLink = fileList[selectedFileIndex];
    const transformStr = `translate(${
      transform.translateX}, ${transform.translateY}) rotate(${transform.rotate}) scale(${
      transform.scaleX}, ${transform.scaleY}) `;
    const options = fileList.map((item, index) => ({ label: item, value: `${index}` }));

    return (
      <ThemeProvider theme={theme}>
        <Box className={classes.root}>
          <div className={classes.select}>
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


          <MoveableControls
            controllerProps={{ keepRatio }}
            ref={this.moveableRef}
            {...{ setTransform: this.setTransform, transform, textureRef: this.textureRef }}
          />
          <svg
            width="100%"
            height="100%"
            style={{ height: '-webkit-fill-available', width: '-webkit-fill-available', transformOrigin: '50% 50%' }}
          >
            <image
              transform={`translate(${
                (screenWidth - faceWidth * faceScale) / 2} ${(screenHeight - faceHeight * faceScale) / 2}) scale(${
                faceScale} ${faceScale}) `}
              ref={this.backdropRef}
              onLoad={(e) => {
                // eslint-disable-next-line no-shadow
                const { height, width } = e.target.getBBox();
                this.setState({ faceDimensions: { height, width } });
              }}
              xlinkHref="/images/shape-templates/great-disdyakisdodecahedron__template__ink.svg"
            />
            <image
              onLoad={() => {
                // eslint-disable-next-line no-shadow
                const { height, width } = this.textureRef.current.getBBox();
                this.setState({ imageDimensions: { height, width } });
                // the movable attempts to calculate the bounds before the image has loaded, hence below
                // deferred by a tick so that style changes from above take effect beforehand
                setTimeout(() => {
                  this.moveableRef.current.updateRect();
                });
              }}
              ref={this.textureRef}
              transform={transformStr}
              style={{ transformOrigin: `${imageWidth / 2}px ${imageHeight / 2}px` }}
              xlinkHref={`/images/textures/${fileLink}`}
            />
          </svg>
        </Box>
      </ThemeProvider>
    );
  }
}
export const MoveableTexture = withStyles({
  root: { backgroundColor: '#333', display: 'block' },
  select: {
    display: 'flex', position: 'absolute', top: 0, right: 0,
  },
  checkboxControlLabel: {
    color: '#fff',
  },
})(MoveableTextureLOC);

const MoveableControls = React.forwardRef(({
  textureRef, setTransform, transform, controllerProps,
}, ref) => {
  const [renderMovable, settRenderMovable] = React.useState(false);

  React.useEffect(() => {
    settRenderMovable(true);
  }, []);

  if (!renderMovable) return null;

  return (
    <>
      <Moveable
        ref={ref}
        target={textureRef.current}
        scalable
        rotatable
        draggable
        {...controllerProps}
        onRotate={({ beforeDelta }) => {
          setTransform({ rotate: transform.rotate + beforeDelta });
        }}
        onScale={({ delta }) => {
          setTransform({ scaleX: transform.scaleX * delta[0], scaleY: transform.scaleY * delta[1] });
          ref.current.updateRect();
        }}
        onDrag={({ beforeDelta }) => {
          setTransform({
            translateX: transform.translateX + beforeDelta[0],
            translateY: transform.translateY + beforeDelta[1],
          });
        }}
      />
    </>
  );
});