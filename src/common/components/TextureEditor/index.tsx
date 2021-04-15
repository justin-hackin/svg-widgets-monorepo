import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@material-ui/styles';
import clsx from 'clsx';
import Joyride, { EVENTS } from 'react-joyride';

import { useWorkspaceMst } from '../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { theme, useStyles } from '../../style/style';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { ShapePreview } from './components/ShapePreview';
import {
  MyStep, SAMPLE_IMAGE_SNAPSHOT, SAMPLE_PATH_SNAPSHOT, STEP_ACTIONS, TOUR_STEPS,
} from '../../util/tour';
import { IS_WEB_BUILD } from '../../constants';

export const TextureEditor = observer(({ hasCloseButton = false }) => {
  const workspaceStore = useWorkspaceMst();
  const { needsTour, setNeedsTour } = workspaceStore.preferences;
  const [stepIndex, setStepIndex] = useState<number>(0);
  const incrementStepIndex = (index) => { setStepIndex(index + 1); };
  const resetStepIndex = () => { setStepIndex(0); };
  const mainAreaRef = useRef<HTMLDivElement>();
  const pyramidNetPluginStore: IPyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore || !pyramidNetPluginStore.textureEditor) {
    return null;
  }
  // ==================================================================================================================
  const {
    setPlacementAreaDimensions, setTextureFromPattern, clearTexture,
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

  const joyrideCallback = ({ type, step, index }: { type: string, step: MyStep, index: number }) => {
    if (type === EVENTS.TOUR_END) {
      setNeedsTour(false);
      // the user could re-activate the tour, rewind
      resetStepIndex();
      clearTexture();
    } else if (type === EVENTS.STEP_AFTER) {
      if (step.nextAction === STEP_ACTIONS.ADD_PATH_TEXTURE) {
        setTextureFromPattern(SAMPLE_PATH_SNAPSHOT);
        incrementStepIndex(index);
      } else if (step.nextAction === STEP_ACTIONS.ADD_IMAGE_TEXTURE) {
        setTextureFromPattern(SAMPLE_IMAGE_SNAPSHOT);
        setTimeout(() => {
          incrementStepIndex(index);
        }, 500);
      } else {
        incrementStepIndex(index);
      }
    } else if (type === EVENTS.TARGET_NOT_FOUND) {
      // this should never happen but if it does, it will prevent inability of advancement
      incrementStepIndex(index);
    }
  };

  return (
    <div className={clsx(classes.fullPage, classes.textureEditorRoot)}>
      <Joyride
        steps={TOUR_STEPS}
        stepIndex={stepIndex}
        callback={joyrideCallback}
        styles={{
          options: {
            backgroundColor: theme.palette.grey.A400,
            arrowColor: theme.palette.grey.A400,
            textColor: theme.palette.grey['300'],
          },
        }}
        run={IS_WEB_BUILD && needsTour}
        showSkipButton
        continuous
        disableCloseOnEsc
        disableOverlay
        hideBackButton
      />
      <TextureControls hasCloseButton={hasCloseButton} />
      <div ref={mainAreaRef} className={classes.textureEditorMainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </div>
  );
});
