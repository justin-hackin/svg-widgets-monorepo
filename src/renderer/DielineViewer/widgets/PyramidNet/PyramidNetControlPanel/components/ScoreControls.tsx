import React from 'react';
import { observer } from 'mobx-react';

import { UncontrolledPanelSelect } from '../../../../../../common/components/PanelSelect';
import { PanelSliderOrTextInput } from '../../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { PanelSwitchUncontrolled } from '../../../../../../common/components/PanelSwitch';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { DEFAULT_SLIDER_STEP } from '../../../../../../common/constants';

const strokeLengthProps = { min: 1, max: 100, step: DEFAULT_SLIDER_STEP };

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const {
    pyramidNetSpec: {
      useDottedStroke, setUseDottedStroke,
      interFaceScoreDashSpec, baseScoreDashSpec, setInterFaceScoreDashSpecPattern, setBaseScoreDashSpecPattern,
    } = {}, dashPatterns,
  } = workspaceStore.selectedStore as IPyramidNetPluginModel;
  const dashPatternOptions = dashPatterns.map(({ label, id }) => ({ value: id, label }));
  return (
    <>
      <PanelSwitchUncontrolled
        value={useDottedStroke}
        valuePath="pyramidNetSpec.useDottedStroke"
        onChange={(e) => { setUseDottedStroke(e.target.checked); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>
          <UncontrolledPanelSelect
            value={interFaceScoreDashSpec.strokeDashPathPattern.id}
            name="interFaceScoreDashSpec.strokeDashPathPattern.id"
            label="Inter-face stroke dash pattern"
            onChange={(e) => {
              setInterFaceScoreDashSpecPattern(e.target.value);
            }}
            options={dashPatternOptions}
          />
          <PanelSliderOrTextInput
            node={interFaceScoreDashSpec}
            property="strokeDashLength"
            label="Inter-face Stroke Dash Length"
            {...strokeLengthProps}
          />
          <PanelSliderOrTextInput
            node={interFaceScoreDashSpec}
            property="strokeDashOffsetRatio"
            label="Inter-face Stroke Dash Offset Ratio"
            {...ratioSliderProps}
          />
          <UncontrolledPanelSelect
            value={baseScoreDashSpec.strokeDashPathPattern.id}
            name="baseScoreDashSpec.strokeDashPathPattern.id"
            label="Base Stroke Dash Pattern"
            onChange={(e) => {
              setBaseScoreDashSpecPattern(e.target.value);
            }}
            options={dashPatternOptions}
          />
          <PanelSliderOrTextInput
            node={baseScoreDashSpec}
            property="strokeDashLength"
            label="Base Stroke Dash Length"
            {...strokeLengthProps}
          />
          <PanelSliderOrTextInput
            node={baseScoreDashSpec}
            property="strokeDashOffsetRatio"
            label="Base Stroke Dash Offset Ratio"
            {...ratioSliderProps}
          />
        </>
      )}
    </>
  );
});
