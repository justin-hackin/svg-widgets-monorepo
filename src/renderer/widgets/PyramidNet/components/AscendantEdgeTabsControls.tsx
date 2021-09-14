import React from 'react';
import {observer} from 'mobx-react';
import {useWorkspaceMst} from '../../../WidgetWorkspace/models/WorkspaceModel';
import {PyramidNetPluginModel} from '../models/PyramidNetMakerStore';
import {TweakableChildrenInputs} from '../../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetPluginModel;
  return (
      <TweakableChildrenInputs parentNode={store.pyramidNetSpec.ascendantEdgeTabsSpec} />
  );
});
