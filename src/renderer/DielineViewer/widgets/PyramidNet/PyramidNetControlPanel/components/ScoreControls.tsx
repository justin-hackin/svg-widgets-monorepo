import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { NodeReferenceSelect } from '../../../../../../common/components/NodeSelect';
import { NodeSliderOrTextInput } from '../../../../../../common/components/NodeSliderOrTextInput';
import { NodeSwitchUncontrolled } from '../../../../../../common/components/NodeSwitch';

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const selectedStore = workspaceStore.selectedStore as PyramidNetPluginModel;
  const { pyramidNetSpec } = selectedStore;
  const { useDottedStroke, interFaceScoreDashSpec, baseScoreDashSpec } = pyramidNetSpec;

  return (
    <>
      <NodeSwitchUncontrolled
        value={useDottedStroke}
        valuePath="pyramidNetSpec.useDottedStroke"
        onChange={(e) => { pyramidNetSpec.setUseDottedStroke(e.target.checked); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>
          {/* TODO: add headers, consider computed labelOverride */}
          <NodeReferenceSelect node={interFaceScoreDashSpec.strokeDashPathPattern} />

          <NodeSliderOrTextInput node={interFaceScoreDashSpec.strokeDashLength} />

          <NodeSliderOrTextInput node={interFaceScoreDashSpec.strokeDashOffsetRatio} />

          <NodeReferenceSelect node={baseScoreDashSpec.strokeDashPathPattern} />

          <NodeSliderOrTextInput node={baseScoreDashSpec.strokeDashLength} />

          <NodeSliderOrTextInput node={baseScoreDashSpec.strokeDashOffsetRatio} />
        </>
      )}
    </>
  );
});
