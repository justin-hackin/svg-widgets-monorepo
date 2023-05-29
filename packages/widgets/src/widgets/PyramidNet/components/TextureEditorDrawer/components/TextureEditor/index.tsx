import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/styles';
import Joyride, { ACTIONS, EVENTS } from 'react-joyride';
import { assertNotNullish, FullPageDiv, useSelectedStore } from 'svg-widget-studio';
import { useResizeDetector } from 'react-resize-detector';
import { TextureControls } from './components/TextureControls';
import { TextureArrangement } from './components/TextureArrangement';
import { ShapePreview } from './components/ShapePreview';
import {
  SAMPLE_IMAGE_SNAPSHOT,
  SAMPLE_PATH_SNAPSHOT,
  STEP_ACTIONS,
  StepWithNextAction,
  TOUR_STEPS,
} from '../../../../../../common/util/tour';
import { RawFaceDecorationModel } from '../../../../models/RawFaceDecorationModel';
import type { PyramidNetWidgetModel } from '../../../../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../../../../models/ImageFaceDecorationPatternModel';
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

export const TextureEditor = observer(() => {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState<number>(0);
  const incrementStepIndex = (index) => { setStepIndex(index + 1); };
  const resetStepIndex = () => { setStepIndex(0); };

  const pyramidNetPluginStore = useSelectedStore<PyramidNetWidgetModel>();
  const { preferences, textureEditor, history } = pyramidNetPluginStore;
  const { needsTour } = preferences ?? {};
  const { faceDecoration } = textureEditor ?? {};

  const { width, height, ref } = useResizeDetector();
  useEffect(() => {
    if (width && height) {
      textureEditor.setPlacementAreaDimensions({
        width: width / 2,
        height,
      });
    }
  }, [width, height]);

  // assigned in onInit
  assertNotNullish(history);
  // ==================================================================================================================
  useTheme();
  // Init

  if (!pyramidNetPluginStore?.textureEditor || faceDecoration instanceof RawFaceDecorationModel) {
    return null;
  }
  // TODO: drag and drop functionality (post-electron)

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
        }, 400);
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
      {/* Tour is broken now, don't render it */}
      {false && (
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
        run={needsTour && pyramidNetPluginStore.textureEditorOpen}
        showSkipButton
        continuous
        disableCloseOnEsc
        disableOverlay
        hideBackButton
      />
      )}
      <TextureControls />
      <div ref={ref} className={classes.mainArea}>
        <TextureArrangement />
        <ShapePreview />
      </div>
    </TextureEditorRoot>
  );
});
