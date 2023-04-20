import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { styled, useTheme } from '@mui/styles';
import Joyride, { ACTIONS, EVENTS } from 'react-joyride';

import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { ShapePreview } from './components/ShapePreview';
import {
  StepWithNextAction,
  SAMPLE_IMAGE_SNAPSHOT,
  SAMPLE_PATH_SNAPSHOT,
  STEP_ACTIONS,
  TOUR_STEPS,
} from '../../../../../../common/util/tour';
import { FullPageDiv } from '../../../../../../common/style/style';
import { RawFaceDecorationModel } from '../../../../models/RawFaceDecorationModel';
import { IS_WEB_BUILD } from '../../../../../../../../common/constants';
import { PyramidNetWidgetModel } from '../../../../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../../../../models/ImageFaceDecorationPatternModel';
import { useWorkspaceMst } from '../../../../../../WidgetWorkspace/models/WorkspaceModel';
import { PathFaceDecorationPatternModel } from '../../../../models/PathFaceDecorationPatternModel';

const classes = { mainArea: 'main-area' };
const TextureEditorRoot = styled(FullPageDiv)(({ theme }) => ({
  backgroundColor: theme.palette.grey.A400,
  height: '100%',
  color: theme.palette.grey['300'],
  [`& .${classes.mainArea}`]: {
    flex: '1 1 auto',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    gridTemplateRows: '100%',
    height: '100%',
    width: '100%',
  },
}));

export const TextureEditor = observer(({ hasCloseButton = false }) => {
  const workspaceStore = useWorkspaceMst();
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const incrementStepIndex = (index) => { setStepIndex(index + 1); };
  const resetStepIndex = () => { setStepIndex(0); };

  const mainAreaRef = useRef<HTMLDivElement>();

  const pyramidNetPluginStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { history } = pyramidNetPluginStore.persistedSpec;
  const { preferences } = pyramidNetPluginStore;
  const { needsTour } = preferences;
  // ==================================================================================================================
  const { textureEditor } = pyramidNetPluginStore;
  const { faceDecoration } = textureEditor;
  useTheme();
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
      textureEditor.setPlacementAreaDimensions({
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

  if (!pyramidNetPluginStore?.textureEditor || faceDecoration instanceof RawFaceDecorationModel) {
    return null;
  }
  // TODO: drag and drop functionality, removed in fd71f4aba9dd4a698e5a2667595cff82c8fb5cf5
  // see commit message for rationale

  const joyrideCallback = ({
    type, step, index, action,
  }: { type: string, step: StepWithNextAction, index: number, action: string }) => {
    if (type === EVENTS.TOUR_STATUS && action === ACTIONS.SKIP) {
      preferences.setNeedsTour(false);
      // the user could re-activate the tour, rewind
      resetStepIndex();
      textureEditor.clearTexturePattern();
      history.clearUndo();
      history.clearRedo();
    } else if (type === EVENTS.STEP_AFTER) {
      if (step.nextAction === STEP_ACTIONS.ADD_PATH_TEXTURE) {
        textureEditor.setTextureFromPattern(new PathFaceDecorationPatternModel(SAMPLE_PATH_SNAPSHOT));
        incrementStepIndex(index);
      } else if (step.nextAction === STEP_ACTIONS.ADD_IMAGE_TEXTURE) {
        textureEditor.setTextureFromPattern(new ImageFaceDecorationPatternModel(SAMPLE_IMAGE_SNAPSHOT));
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
    <TextureEditorRoot>
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
      <div ref={mainAreaRef} className={classes.mainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </TextureEditorRoot>
  );
});
