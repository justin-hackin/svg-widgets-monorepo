/* eslint-disable no-param-reassign */
import React, { forwardRef, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import { createMuiTheme } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

// @ts-ignore
import darkTheme from '../DielineViewer/data/material-ui-dark-theme';
import { ShapePreview } from './components/ShapePreview';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { useWorkspaceMst } from '../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../DielineViewer/style';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
// TODO: make router wrap with styles
// @ts-ignore
export const theme = createMuiTheme(darkTheme);

const TextureTransformEditorRaw = forwardRef((props, ref) => {
  const workspaceStore = useWorkspaceMst();
  const mainAreaRef = useRef();
  const pyramidNetPluginStore:IPyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore || !pyramidNetPluginStore.textureEditor) { return null; }
  // ==================================================================================================================
  const {
    setPlacementAreaDimensions,
  } = pyramidNetPluginStore.textureEditor;

  const classes = useStyles();
  // Init
  useEffect(() => {
    const resizeHandler = () => {
      if (!mainAreaRef.current) { return; }
      // @ts-ignore
      const { width, height } = mainAreaRef.current.getBoundingClientRect();
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

  // if (!placementAreaDimensions || !decorationBoundary) { return null; }
  // const { height: screenHeight = 0, width: screenWidth = 0 } = screenDimensions;

  return (
    /* @ts-ignore */
    <Box ref={ref} className={classes.textureEditorRoot} {...props}>
      {pyramidNetPluginStore && pyramidNetPluginStore.textureEditor && (
      <>
        <TextureControls />
        <div ref={mainAreaRef} className={classes.textureEditorMainArea}>
          <TextureArrangement />
          <ShapePreview />
        </div>
      </>
      )}
    </Box>
  );
});

export const TextureTransformEditor = observer(TextureTransformEditorRaw);
