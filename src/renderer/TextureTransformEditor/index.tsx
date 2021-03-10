/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

// @ts-ignore
import darkTheme from '../DielineViewer/data/material-ui-dark-theme';
import { ShapePreview } from './components/ShapePreview';
import { TextureControls } from './components/TextureControls';
import { useStyles } from './style';
import { TextureArrangement } from './components/TextureArrangement';
import { useWorkspaceMst } from '../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../DielineViewer/models/PyramidNetMakerStore';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
// TODO: make router wrap with styles
// @ts-ignore
export const theme = createMuiTheme(darkTheme);

export const TextureTransformEditor = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore:IPyramidNetPluginModel = workspaceStore.selectedStore;
  const classes = useStyles();
  // ==================================================================================================================
  const {
    placementAreaDimensions, setPlacementAreaDimensions, decorationBoundary,
  } = pyramidNetPluginStore.textureEditor;

  // Init
  useEffect(() => {
    const resizeHandler = () => {
      const { outerWidth: width, outerHeight: height } = window;
      setPlacementAreaDimensions({ width: width / 2, height });
    };

    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // TODO: drag and drop functionality, removed in fd71f4aba9dd4a698e5a2667595cff82c8fb5cf5
  // see commit message for rationale

  if (!placementAreaDimensions || !decorationBoundary) { return null; }
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        <TextureControls />
        <div style={{ position: 'absolute', left: '50%' }}>
          <ShapePreview />
        </div>
        <TextureArrangement />
      </Box>
    </ThemeProvider>
  );
});
