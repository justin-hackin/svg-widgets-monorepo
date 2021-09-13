import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { NodeSliderOrTextInput } from '../../../../../../common/components/NodeSliderOrTextInput';
import { NodeSlider } from '../../../../../../common/NodeSlider';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetPluginModel;
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <NodeSlider node={ascendantEdgeTabsSpec.tabsCount} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.tabDepthToTraversalLength} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.holeReachToTabDepth} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.tabEdgeEndpointsIndentation} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.tabControlPointsAngle} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.tabControlPointsProtrusion} />

      <NodeSliderOrTextInput node={ascendantEdgeTabsSpec.tabStartGapToTabDepth} />

      <NodeSlider node={ascendantEdgeTabsSpec.holeWidthRatio} />

      <NodeSlider node={ascendantEdgeTabsSpec.flapRoundingDistanceRatio} />
    </>
  );
});
