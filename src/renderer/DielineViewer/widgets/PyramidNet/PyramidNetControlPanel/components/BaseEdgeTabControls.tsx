import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { NodeSwitchUncontrolled } from '../../../../../../common/components/NodeSwitch';
import { BendGuideValleyModel } from '../../../../util/shapes/baseEdgeConnectionTab';
import { TweakableInput } from '../../../../../../common/components/TweakableInput';

export const BaseEdgeTabControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const {
    pyramidNetSpec: {
      baseEdgeTabsSpec,
    } = {},
  } = workspaceStore.selectedStore as PyramidNetPluginModel;

  return (
    <>
      <TweakableInput node={baseEdgeTabsSpec.roundingDistanceRatio} />

      <TweakableInput node={baseEdgeTabsSpec.scoreTabMidline} />

      <TweakableInput node={baseEdgeTabsSpec.finDepthToTabDepth} />

      <TweakableInput node={baseEdgeTabsSpec.tabDepthToAscendantTabDepth} />

      <TweakableInput node={baseEdgeTabsSpec.holeDepthToTabDepth} />

      <TweakableInput node={baseEdgeTabsSpec.finOffsetRatio} />

      <TweakableInput node={baseEdgeTabsSpec.holeBreadthToHalfWidth} />

      <TweakableInput node={baseEdgeTabsSpec.holeTabClearance} />

      <TweakableInput node={baseEdgeTabsSpec.holeTaper} />

      <TweakableInput node={baseEdgeTabsSpec.tabConjunctionClearance} />

      <NodeSwitchUncontrolled
        label="Use Bend Guide Valley"
        valuePath="BaseEdgeTabControls__useBendGuideValley"
        value={!!baseEdgeTabsSpec.bendGuideValley}
        onChange={(e) => {
          if (e.target.checked) {
            baseEdgeTabsSpec.resetBendGuideValleyToDefault();
          } else {
            baseEdgeTabsSpec.unsetBendGuideValley();
          }
        }}
      />
      {baseEdgeTabsSpec.bendGuideValley instanceof BendGuideValleyModel && (
        <>
          <TweakableInput node={baseEdgeTabsSpec.bendGuideValley.depthRatio} />

          <TweakableInput node={baseEdgeTabsSpec.bendGuideValley.theta} />
        </>
      )}
    </>
  );
});
