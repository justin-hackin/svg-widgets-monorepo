import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@material-ui/core';
import { useWorkspaceMst, WorkspaceModel } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { PreferencesModel } from '../../../WidgetWorkspace/models/PreferencesModel';
import { TweakableChildrenInputs }
  from '../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';

export const PreferencesControls = observer(() => {
  const workspaceStore: WorkspaceModel = useWorkspaceMst();
  const { preferences }: { preferences: PreferencesModel } = workspaceStore;

  return (
    <>
      <TweakableChildrenInputs parentNode={preferences} />

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          workspaceStore.resetPreferences();
        }}
      >
        Reset
      </Button>
    </>
  );
});
