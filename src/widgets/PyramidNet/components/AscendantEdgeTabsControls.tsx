import React from 'react';
import { observer } from 'mobx-react';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { TweakableChildrenInputs }
  from '../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { useWorkspaceMst } from '../../../WidgetWorkspace/rootStore';

export const AscendantEdgeTabsControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const store = workspaceStore.selectedStore as PyramidNetWidgetModel;
  return (
    <TweakableChildrenInputs parentNode={store.ascendantEdgeTabsSpec} />
  );
});
