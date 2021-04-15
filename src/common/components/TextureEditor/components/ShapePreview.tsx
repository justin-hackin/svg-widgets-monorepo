import React from 'react';
import { observer } from 'mobx-react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import clsx from 'clsx';
import { IconButton } from '@material-ui/core';
import { ITextureEditorModel } from '../models/TextureEditorModel';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { useStyles } from '../../../style/style';
import { TOUR_ELEMENT_CLASSES } from '../../../util/tour';
import { IS_ELECTRON_BUILD } from '../../../constants';

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const handle = IS_ELECTRON_BUILD ? null : useFullScreenHandle();
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();

  const store:ITextureEditorModel = workspaceStore.selectedStore.textureEditor;
  const { shapePreview: { setup, tearDown }, setShapePreviewIsFullScreen } = store;

  const threeContainerRef = useRef<HTMLDivElement>();

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef) { return null; }
    setup(threeContainerRef.current);
    return (() => { tearDown(); });
  }, [threeContainerRef]);

  const previewContainer = (
    <div
      ref={threeContainerRef}
      className={clsx(classes.shapePreviewContainer, TOUR_ELEMENT_CLASSES.SHAPE_PREVIEW_AREA)}
    />
  );
  return IS_ELECTRON_BUILD ? previewContainer : (
    <>
      <IconButton
        className={clsx(classes.enterFullScreenButton, TOUR_ELEMENT_CLASSES.FULL_SCREEN_BUTTON)}
        onClick={handle.enter}
        component="span"
      >
        <FullscreenIcon fontSize="large" />
      </IconButton>
      <FullScreen
        handle={handle}
        onChange={(isFullScreen) => {
          setShapePreviewIsFullScreen(isFullScreen);
        }}
      >
        {previewContainer}
      </FullScreen>
    </>
  );
});
