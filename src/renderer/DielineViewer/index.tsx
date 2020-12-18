// import { useQueryParam, StringParam, JsonParam } from 'use-query-params';
import React from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core';

import darkTheme from './data/material-ui-dark-theme';
import { GridPattern } from './components/ResizableZoomPan/components/GridPattern';
import { ResizableZoomPan } from './components/ResizableZoomPan';
import {
  IWorkspaceModel, useWorkspaceMst, WorkspaceStoreProvider,
} from './models/WorkspaceModel';
import { WidgetControlPanel } from './components/WidgetControlPanel';

const patternId = 'grid-pattern';
// @ts-ignore
const theme = createMuiTheme(darkTheme);

export const DielineViewerLOC = () => {
  const {
    svgDimensions, SelectedControlledSvgComponent, selectedControlPanelProps,
  } = useWorkspaceMst() as IWorkspaceModel;
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <ResizableZoomPan SVGBackground={`url(#${patternId})`}>
          <svg {...svgDimensions}>
            <GridPattern patternId={patternId} />
            <SelectedControlledSvgComponent />
          </svg>
        </ResizableZoomPan>
        <WidgetControlPanel {...selectedControlPanelProps} />
      </div>
    </ThemeProvider>
  );
};

export const DielineViewer = observer(() => (
  <WorkspaceStoreProvider>
    <DielineViewerLOC />
  </WorkspaceStoreProvider>
));
