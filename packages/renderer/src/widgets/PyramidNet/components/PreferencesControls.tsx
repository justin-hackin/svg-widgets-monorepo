import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { useWorkspaceMst, WorkspaceModel } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { TweakableChildrenInputs }
  from '../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const PreferencesControls = observer(() => {
  const workspaceStore: WorkspaceModel = useWorkspaceMst();
  const workspacePreferences = workspaceStore.preferences;
  const selectedStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const widgetPreferences = selectedStore.preferences;

  return (
    <>
      <TweakableChildrenInputs parentNode={workspacePreferences} />
      <TweakableChildrenInputs parentNode={widgetPreferences} />

      <Button
        variant="contained"
        onClick={async () => {
          await workspaceStore.resetPreferences();
          if (selectedStore.resetPreferences) {
            await selectedStore.resetPreferences();
          }
        }}
      >
        Reset
      </Button>
    </>
  );
});
