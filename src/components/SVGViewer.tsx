// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React, { useState } from 'react';
import isNaN from 'lodash-es/isNaN';
import ReactResizeDetector from 'react-resize-detector';
import { ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN } from 'react-svg-pan-zoom';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';
import { store } from '~/data/state';
import {
  PyramidNet,
} from './PyramidNet';
import darkTheme from '~/data/material-ui-dark-theme.json';
// eslint-disable-next-line import/no-cycle
import { PersistentDrawerLeft } from './drawer';
import { GridPattern } from './GridPattern';

// @ts-ignore
const theme = createMuiTheme(darkTheme);
const svgDimensions = { width: 1024, height: 960 };
const isValidNumber = (num) => typeof num === 'number' && !isNaN(num);
export function SVGViewer() {
  // TODO: make this work
  // const [value = INITIAL_VALUE, setValue] = useQueryParam('ReactSVGPanZoomValue', JsonParam);
  // const [tool = TOOL_PAN, setTool] = useQueryParam('ReactSVGPanZoomTool', StringParam);
  const [viewValue, setValue] = useState(INITIAL_VALUE);
  const [tool, setTool] = useState(TOOL_PAN);


  const patternId = 'grid-pattern';
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
      <ReactResizeDetector handleWidth handleHeight>
        {({ width, height }) => ((!isValidNumber(width) || !isValidNumber(height)) ? <div /> : (
          <ReactSVGPanZoom
            value={viewValue}
            width={width}
            height={height}
            background="#454545"
            SVGBackground={`url(#${patternId})`}
            tool={tool}
            onChangeValue={(val) => {
              setValue(val);
            }}
            onChangeTool={setTool}
            id="viewer"
          >
            <svg {...svgDimensions}>
              <GridPattern patternId={patternId} />
              <g transform="translate(300, 300) scale(4, 4) ">
                <PyramidNet store={store} />
              </g>
            </svg>
          </ReactSVGPanZoom>
        ))}
      </ReactResizeDetector>
      <ThemeProvider theme={theme}>
        <PersistentDrawerLeft store={store} />
      </ThemeProvider>
    </div>

  );
}
