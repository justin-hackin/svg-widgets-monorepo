import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { NodeSlider } from '../../../../../../common/NodeSlider';
import { NodeSwitch, NodeSwitchUncontrolled } from '../../../../../../common/components/NodeSwitch';
import { NodeSliderOrTextInput } from '../../../../../../common/components/NodeSliderOrTextInput';
import { BendGuideValleyModel } from '../../../../util/shapes/baseEdgeConnectionTab';

export const BaseEdgeTabControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const {
    pyramidNetSpec: {
      baseEdgeTabsSpec,
    } = {},
  } = workspaceStore.selectedStore as PyramidNetPluginModel;

  return (
    <>
      <NodeSlider node={baseEdgeTabsSpec.roundingDistanceRatio} />

      <NodeSwitch node={baseEdgeTabsSpec.scoreTabMidline} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.finDepthToTabDepth} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.tabDepthToAscendantTabDepth} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.holeDepthToTabDepth} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.finOffsetRatio} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.holeBreadthToHalfWidth} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.holeTabClearance} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.holeTaper} />

      <NodeSliderOrTextInput node={baseEdgeTabsSpec.tabConjunctionClearance} />

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
          <NodeSlider node={baseEdgeTabsSpec.bendGuideValley.depthRatio} />

          <NodeSliderOrTextInput node={baseEdgeTabsSpec.bendGuideValley.theta} />
        </>
      )}
    </>
  );
});
