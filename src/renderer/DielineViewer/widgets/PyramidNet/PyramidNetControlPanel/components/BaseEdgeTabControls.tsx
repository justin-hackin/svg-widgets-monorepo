import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { BendGuideValleyModel } from '../../../../util/shapes/baseEdgeConnectionTab';
import { TweakableInput } from '../../../../../../common/keystone-tweakables/material-ui-controls/TweakableInput';
import { SimpleSwitch } from '../../../../../../common/keystone-tweakables/material-ui-controls/SimpleSwitch';

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

      <SimpleSwitch
        label="Use Bend Guide Valley"
        name="BaseEdgeTabControls__useBendGuideValley"
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
