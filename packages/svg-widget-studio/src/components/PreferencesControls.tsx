import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@mui/material';
import { useWorkspaceMst } from '../rootStore';
import { TweakableChildrenInputs } from '../inputs/TweakableChildrenInputs';

export const PreferencesControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const workspacePreferences = workspaceStore.preferences;
  const { selectedStore } = workspaceStore;
  // @ts-ignore
  const widgetPreferences = selectedStore?.preferences;

  return (
    <>
      <TweakableChildrenInputs parentNode={workspacePreferences} />
      { widgetPreferences && (<TweakableChildrenInputs parentNode={widgetPreferences} />)}

      <Button
        variant="contained"
        onClick={async () => {
          await workspaceStore.resetPreferences();
        }}
      >
        Reset
      </Button>
    </>
  );
});
