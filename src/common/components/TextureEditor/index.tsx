import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/styles';
import clsx from 'clsx';
import Joyride from 'react-joyride';

import { useWorkspaceMst } from '../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../../style/style';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { ShapePreview } from './components/ShapePreview';
import { TOUR_STEPS } from '../../constants';

export const TextureEditor = observer(({ hasCloseButton = false }) => {
  const workspaceStore = useWorkspaceMst();
  const mainAreaRef = useRef<HTMLDivElement>();
  const pyramidNetPluginStore: IPyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore || !pyramidNetPluginStore.textureEditor) {
    return null;
  }
  // ==================================================================================================================
  const {
    setPlacementAreaDimensions,
  } = pyramidNetPluginStore.textureEditor;
  useTheme();
  const classes = useStyles();
  // Init
  useEffect(() => {
    const resizeHandler = () => {
      if (!mainAreaRef.current) {
        return;
      }
      const {
        width,
        height,
      } = mainAreaRef.current.getBoundingClientRect();
      setPlacementAreaDimensions({
        width: width / 2,
        height,
      });
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
    <div className={clsx(classes.fullPage, classes.textureEditorRoot)}>
      <Joyride steps={TOUR_STEPS} showSkipButton continuous disableCloseOnEsc disableOverlayClose />
      <TextureControls hasCloseButton={hasCloseButton} />
      <div ref={mainAreaRef} className={classes.textureEditorMainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </div>
  );
});
