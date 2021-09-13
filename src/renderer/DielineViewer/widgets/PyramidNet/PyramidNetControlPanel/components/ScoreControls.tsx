import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { NodeSwitchUncontrolled } from '../../../../../../common/components/NodeSwitch';
import { TweakableInput } from '../../../../../../common/components/TweakableInput';

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
          <TweakableInput node={interFaceScoreDashSpec.strokeDashPathPattern} />

          <TweakableInput node={interFaceScoreDashSpec.strokeDashLength} />

          <TweakableInput node={interFaceScoreDashSpec.strokeDashOffsetRatio} />

          <TweakableInput node={baseScoreDashSpec.strokeDashPathPattern} />

          <TweakableInput node={baseScoreDashSpec.strokeDashLength} />

          <TweakableInput node={baseScoreDashSpec.strokeDashOffsetRatio} />
        </>
      )}
    </>
  );
});
