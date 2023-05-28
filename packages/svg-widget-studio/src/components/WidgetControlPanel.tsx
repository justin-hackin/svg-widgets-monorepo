import React from 'react';
import { observer } from 'mobx-react';
import { AssetsAccordion } from './AssetsAccordion';
import { useWorkspaceMst } from '../rootStore';
import { WidgetControlPanelAppBar } from './WidgetControlPanelAppBar';
import { assertNotNullish } from '../helpers/assert';
import { TweakableChildrenInputs } from '../inputs/TweakableChildrenInputs';

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
