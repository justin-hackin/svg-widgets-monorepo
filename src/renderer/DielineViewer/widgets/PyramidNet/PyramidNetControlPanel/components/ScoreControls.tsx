import React from 'react';
import { observer } from 'mobx-react';
import { PanelSliderOrTextInput } from '../../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { PanelSwitchUncontrolled } from '../../../../../../common/components/PanelSwitch';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { DEFAULT_SLIDER_STEP } from '../../../../../../common/constants';
import { NodeReferenceSelect } from '../../../../../../common/components/NodeSelect';

const strokeLengthProps = { min: 1, max: 100, step: DEFAULT_SLIDER_STEP };

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const selectedStore = workspaceStore.selectedStore as PyramidNetPluginModel;
  const { pyramidNetSpec } = selectedStore;
  const { useDottedStroke, interFaceScoreDashSpec, baseScoreDashSpec } = pyramidNetSpec;

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
          <NodeReferenceSelect node={interFaceScoreDashSpec.strokeDashPathPattern} />

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

          <NodeReferenceSelect node={baseScoreDashSpec.strokeDashPathPattern} />

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
