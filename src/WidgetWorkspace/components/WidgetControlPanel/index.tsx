import React from 'react';
import { observer } from 'mobx-react';
import { assertNotNullish } from '@/common/util/assert';
import {
  TweakableChildrenInputs,
} from '../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from '../AssetsAccordion';
import { useWorkspaceMst } from '../../rootStore';
import { WidgetControlPanelAppBar } from './components/WidgetControlPanelAppBar';

export const WidgetControlPanel = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore } = workspaceStore;
  // parent component conditional rendering ensures this
  assertNotNullish(selectedStore);
  const {
    PanelContent,
  } = selectedStore;

  return (
    <div>
      <WidgetControlPanelAppBar />
      <AssetsAccordion assetDefinition={selectedStore.assetDefinition} />
      <div>
        {PanelContent ? (<PanelContent />) : (<TweakableChildrenInputs parentNode={selectedStore} />)}
      </div>
    </div>
  );
});
