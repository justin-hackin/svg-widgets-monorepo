// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';

import {
  PreferencesStoreProvider,
  PyramidNetFactoryStoreProvider,
  usePyramidNetFactoryMst,
} from './models';
import darkTheme from './data/material-ui-dark-theme';
import { PyramidNetStoreContainer } from './components/PyramidNet';
import { ControlPanel } from './components/ControlPanel';
import { GridPattern } from './components/ResizableZoomPan/components/GridPattern';
import { ResizableZoomPan } from './components/ResizableZoomPan';

const patternId = 'grid-pattern';
// @ts-ignore
const theme = createMuiTheme(darkTheme);
export const DielineViewer = observer(() => {
  const { svgDimensions } = usePyramidNetFactoryMst();
  return (
    <PreferencesStoreProvider>
      <PyramidNetFactoryStoreProvider>
        <ThemeProvider theme={theme}>
          <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
            <ResizableZoomPan SVGBackground={`url(#${patternId})`}>
              <svg {...svgDimensions}>
                <GridPattern patternId={patternId} />
                <PyramidNetStoreContainer />
              </svg>
            </ResizableZoomPan>
            <ControlPanel />
          </div>
        </ThemeProvider>
      </PyramidNetFactoryStoreProvider>
    </PreferencesStoreProvider>
  );
});
