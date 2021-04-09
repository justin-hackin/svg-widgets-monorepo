import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/styles';
import clsx from 'clsx';
import Joyride, { EVENTS } from 'react-joyride';

import { useWorkspaceMst } from '../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../../style/style';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { ShapePreview } from './components/ShapePreview';
import {
  SAMPLE_PATH_D, SAMPLE_IMAGE_DATA, TOUR_ELEMENT_CLASSES, TOUR_STEPS, STEP_ACTIONS,
} from '../../util/analytics';

export const TextureEditor = observer(({ hasCloseButton = false }) => {
  const workspaceStore = useWorkspaceMst();
  const { needsTour, setNeedsTour } = workspaceStore.preferences;
  const mainAreaRef = useRef<HTMLDivElement>();
  const pyramidNetPluginStore: IPyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore || !pyramidNetPluginStore.textureEditor) {
    return null;
  }
  // ==================================================================================================================
  const {
    setPlacementAreaDimensions, setTexturePath, setTextureImage,
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
  const joyrideCallback = ({ type, step }) => {
    if (type === EVENTS.TOUR_END) {
      setNeedsTour(false);
      return;
    }
    if (step.action === STEP_ACTIONS.ADD_PATH_TEXTURE) {
      setTexturePath(SAMPLE_PATH_D, 'sample_svg');
    } else if (step.target === `.${TOUR_ELEMENT_CLASSES.DRAG_MODE_INDICATOR}`) {
      setTextureImage(SAMPLE_IMAGE_DATA, 'sample_png');
    }
  };

  return (
    <div className={clsx(classes.fullPage, classes.textureEditorRoot)}>
      <Joyride
        steps={TOUR_STEPS}
        callback={joyrideCallback}
        run={needsTour}
        showSkipButton
        continuous
        disableCloseOnEsc
        disableOverlay
      />
      <TextureControls hasCloseButton={hasCloseButton} />
      <div ref={mainAreaRef} className={classes.textureEditorMainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </div>
  );
});
