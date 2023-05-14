import React from 'react';
import { observer } from 'mobx-react';
import { TweakableChildrenInputs } from '../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { AssetsAccordion } from './AssetsAccordion';
import { BaseWidgetClass } from '../widget-types/BaseWidgetClass';
import { useWorkspaceMst } from '../rootStore';
import { WidgetControlPanelAppBar } from './WidgetControlPanelAppBar';

export const WidgetControlPanel = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedStore }: { selectedStore: BaseWidgetClass } = workspaceStore;
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
