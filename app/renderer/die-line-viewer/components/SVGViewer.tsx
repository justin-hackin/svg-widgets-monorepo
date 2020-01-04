// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import isNaN from 'lodash-es/isNaN';
import ReactResizeDetector from 'react-resize-detector';
import { ReactSVGPanZoom, INITIAL_VALUE, TOOL_PAN } from 'react-svg-pan-zoom';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';

import darkTheme from '../data/material-ui-dark-theme.json';
import { store } from '../data/PyramidNetMakerStore';
import { PyramidNet } from './PyramidNet';

// eslint-disable-next-line import/no-cycle
import { ControlPanel } from './ControlPanel';
import { GridPattern } from './GridPattern';

// @ts-ignore
const theme = createMuiTheme(darkTheme);
const isValidNumber = (num) => typeof num === 'number' && !isNaN(num);
export const SVGViewer = observer(() => {
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
            <svg {...store.svgDimensions}>
              <GridPattern patternId={patternId} />
              <g transform="translate(300, 300)">
                <PyramidNet store={store} />
              </g>
            </svg>
          </ReactSVGPanZoom>
        ))}
      </ReactResizeDetector>
      <ThemeProvider theme={theme}>
        <ControlPanel store={store} />
      </ThemeProvider>
    </div>

  );
});
