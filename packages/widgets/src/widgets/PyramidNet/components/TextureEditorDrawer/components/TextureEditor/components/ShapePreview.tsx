import React from 'react';
import { observer } from 'mobx-react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import { IconButton } from '@mui/material';
import { styled } from '@mui/styles';
import clsx from 'clsx';
import { useWorkspaceMst } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../../../../../models/PyramidNetWidgetStore';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../common/util/tour';

const classes = {
  enterFullScreenButton: 'shape-preview__enter-full-screen-button',
};

const WebContainer = styled('div')(({ theme }) => ({
  [`& .${classes.enterFullScreenButton}`]: {
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    position: 'absolute',
  },
}));

const { useEffect, useRef } = React;

export const ShapePreview = observer(() => {
  const handle = useFullScreenHandle();
  const workspaceStore = useWorkspaceMst();

  const { textureEditor } = workspaceStore.selectedStore as unknown as PyramidNetWidgetModel;

  const threeContainerRef = useRef<HTMLDivElement>(null);

  // THREE rendering setup
  useEffect(() => {
    if (!threeContainerRef?.current) { return; }
    textureEditor.createShapePreview(threeContainerRef.current);
  }, [threeContainerRef]);

  return (
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
        <div
          ref={threeContainerRef}
          className={TOUR_ELEMENT_CLASSES.SHAPE_PREVIEW_AREA}
        />
      </FullScreen>
    </WebContainer>
  );
});
