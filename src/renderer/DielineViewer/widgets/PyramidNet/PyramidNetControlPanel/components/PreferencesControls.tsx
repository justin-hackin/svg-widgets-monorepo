import React from 'react';
import { observer } from 'mobx-react';
import { Button, Divider } from '@material-ui/core';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PreferencesModel } from '../../../../models/PreferencesModel';
import { TweakableInput } from '../../../../../../common/keystone-tweakables/material-ui-controls/TweakableInput';

export const PreferencesControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { preferences } = workspaceStore;
  const {
    displayUnit,
    documentHeight,
    documentWidth,
    useClonesForBaseTabs,
    useClonesForDecoration,
    scoreStrokeColor,
    cutStrokeColor,
    registrationStrokeColor,
    printRegistrationType,
    strokeWidth,
  } = preferences as PreferencesModel;

  return (
    <>
      <TweakableInput node={displayUnit} />

      <TweakableInput node={documentWidth} />

      <TweakableInput node={documentHeight} />

      <TweakableInput node={useClonesForBaseTabs} />

      <TweakableInput node={useClonesForDecoration} />

      <TweakableInput node={strokeWidth} />

      <TweakableInput node={scoreStrokeColor} />

      <TweakableInput node={cutStrokeColor} />

      <TweakableInput node={registrationStrokeColor} />

      <Divider />

      <TweakableInput node={printRegistrationType} />

      <TweakableInput node={preferences.registrationPadding} />

      <TweakableInput node={preferences.registrationMarkLength} />

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
