import React from 'react';
import { observer } from 'mobx-react';

import { UncontrolledPanelSelect } from '../../../../../../common/components/PanelSelect';
import { PanelSliderOrTextInput } from '../../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { PanelSwitchUncontrolled } from '../../../../../../common/components/PanelSwitch';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { DEFAULT_SLIDER_STEP } from '../../../../../../common/constants';

const strokeLengthProps = { min: 1, max: 100, step: DEFAULT_SLIDER_STEP };

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const selectedStore = workspaceStore.selectedStore as PyramidNetPluginModel;
  const { pyramidNetSpec, dashPatterns } = selectedStore;
  const { useDottedStroke, interFaceScoreDashSpec, baseScoreDashSpec } = pyramidNetSpec;
  const dashPatternOptions = dashPatterns
    .map(({ strokeDashPathPattern }) => strokeDashPathPattern)
    .map(({ label, $modelId }) => ({ value: $modelId, label }));
  return (
    <>
      <PanelSwitchUncontrolled
        value={useDottedStroke}
        valuePath="pyramidNetSpec.useDottedStroke"
        onChange={(e) => { pyramidNetSpec.setUseDottedStroke(e.target.checked); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>
          <UncontrolledPanelSelect
            value={interFaceScoreDashSpec.strokeDashPathPattern.$modelId}
            name="interFaceScoreDashSpec.strokeDashPathPattern.$modelId"
            label="Inter-face stroke dash pattern"
            onChange={(e) => {
              pyramidNetSpec.setInterFaceScoreDashSpecPattern(e.target.value);
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
            value={baseScoreDashSpec.strokeDashPathPattern.$modelId}
            name="baseScoreDashSpec.strokeDashPathPattern.$modelId"
            label="Base Stroke Dash Pattern"
            onChange={(e) => {
              pyramidNetSpec.setBaseScoreDashSpecPattern(e.target.value);
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
