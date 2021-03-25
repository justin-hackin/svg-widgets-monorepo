/* eslint-disable no-param-reassign */
import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useTheme } from '@material-ui/styles';
import { Drawer } from '@material-ui/core';

import { ShapePreview } from './components/ShapePreview';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { useWorkspaceMst } from '../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../DielineViewer/style';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin

export const TextureTransformEditor = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const mainAreaRef = useRef();
  const pyramidNetPluginStore:IPyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore || !pyramidNetPluginStore.textureEditor) { return null; }
  // ==================================================================================================================
  const {
    setPlacementAreaDimensions,
  } = pyramidNetPluginStore.textureEditor;
  useTheme();
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
    <Drawer
      className={classes.textureEditorRoot}
      anchor="right"
      variant="persistent"
      open={pyramidNetPluginStore.textureEditorOpen}
      classes={{ paper: classes.textureEditorPaper }}
      transitionDuration={500}
    >
      <TextureControls />
      <div ref={mainAreaRef} className={classes.textureEditorMainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </Drawer>
  );
});
