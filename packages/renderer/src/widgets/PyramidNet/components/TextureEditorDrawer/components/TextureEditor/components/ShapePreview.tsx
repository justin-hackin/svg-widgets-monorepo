import React from 'react';
import { observer } from 'mobx-react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { IconButton } from '@mui/material';
import { styled } from '@mui/styles';
import clsx from 'clsx';
import { PyramidNetWidgetModel } from '../../../../../models/PyramidNetWidgetStore';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../common/util/tour';
import { IS_ELECTRON_BUILD } from '../../../../../../../../../common/constants';
import { useWorkspaceMst } from '../../../../../../../WidgetWorkspace/models/WorkspaceModel';

const classes = {
  enterFullScreenButton: 'shape-preview__enter-full-screen-button',
};

const WebContainer = styled('div')(({ theme }) => ({
  [`& .${classes.enterFullScreenButton} .MuiButtonBase-root`]: {
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    position: 'absolute',
  },
}));

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const handle = IS_ELECTRON_BUILD ? null : useFullScreenHandle();
  const workspaceStore = useWorkspaceMst();

  const { textureEditor } = workspaceStore.selectedStore as PyramidNetWidgetModel;

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
    <WebContainer>
      <IconButton
        className={clsx(classes.enterFullScreenButton, TOUR_ELEMENT_CLASSES.FULL_SCREEN_BUTTON)}
        onClick={handle.enter}
        component="span"
        size="large"
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
    </WebContainer>
  );
});
