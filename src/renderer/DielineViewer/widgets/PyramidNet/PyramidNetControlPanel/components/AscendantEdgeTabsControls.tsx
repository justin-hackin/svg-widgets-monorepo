import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PyramidNetPluginModel } from '../../../../models/PyramidNetMakerStore';
import { TweakableInput } from '../../../../../../common/keystone-tweakables/material-ui-controls/TweakableInput';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetPluginModel;
  const { pyramidNetSpec: { ascendantEdgeTabsSpec } = {} } = store;
  return (
    <>
      <TweakableInput node={ascendantEdgeTabsSpec.tabsCount} />

      <TweakableInput node={ascendantEdgeTabsSpec.tabDepthToTraversalLength} />

      <TweakableInput node={ascendantEdgeTabsSpec.holeReachToTabDepth} />

      <TweakableInput node={ascendantEdgeTabsSpec.tabEdgeEndpointsIndentation} />

      <TweakableInput node={ascendantEdgeTabsSpec.tabControlPointsAngle} />

      <TweakableInput node={ascendantEdgeTabsSpec.tabControlPointsProtrusion} />

      <TweakableInput node={ascendantEdgeTabsSpec.tabStartGapToTabDepth} />

      <TweakableInput node={ascendantEdgeTabsSpec.holeWidthRatio} />

      <TweakableInput node={ascendantEdgeTabsSpec.flapRoundingDistanceRatio} />
    </>
  );
});
