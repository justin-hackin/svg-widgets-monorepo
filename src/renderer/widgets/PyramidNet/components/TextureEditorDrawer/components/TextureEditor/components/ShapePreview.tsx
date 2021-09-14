import React from 'react';
import { observer } from 'mobx-react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import clsx from 'clsx';
import { IconButton } from '@material-ui/core';
import { PyramidNetPluginModel } from '../../../../../models/PyramidNetMakerStore';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../../common/util/tour';
import { IS_ELECTRON_BUILD } from '../../../../../../../../common/constants';
import { useStyles } from '../../../../../../../../common/style/style';
import { useWorkspaceMst } from '../../../../../../../WidgetWorkspace/models/WorkspaceModel';

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const handle = IS_ELECTRON_BUILD ? null : useFullScreenHandle();
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();

  const { textureEditor } = workspaceStore.selectedStore as PyramidNetPluginModel;

  const threeContainerRef = useRef<HTMLDivElement>();

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef) { return; }
    textureEditor.createShapePreview(threeContainerRef.current);
  }, [threeContainerRef]);

  const previewContainer = (
    <div
      ref={threeContainerRef}
      className={TOUR_ELEMENT_CLASSES.SHAPE_PREVIEW_AREA}
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
          textureEditor.setShapePreviewIsFullScreen(isFullScreen);
        }}
      >
        {previewContainer}
      </FullScreen>
    </>
  );
});
