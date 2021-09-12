import React from 'react';
import { observer } from 'mobx-react';
import { Button, Divider } from '@material-ui/core';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { NodeSwitch } from '../../../../../../common/components/NodeSwitch';
import { NodeColorPicker } from '../../../../../../common/components/NodeColorPicker';
import { NodeRadio } from '../../../../../../common/components/NodeRadio';
import { NodeNumberTextInput } from '../../../../../../common/components/NodeNumberTextInput';
import { NodeSliderOrTextInput } from '../../../../../../common/components/NodeSliderOrTextInput';
import { PreferencesModel } from '../../../../models/PreferencesModel';

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
      <NodeRadio node={displayUnit} />

      <NodeNumberTextInput node={documentWidth} />

      <NodeNumberTextInput node={documentHeight} />

      <NodeSwitch node={useClonesForBaseTabs} />

      <NodeSwitch node={useClonesForDecoration} />

      <NodeSliderOrTextInput node={strokeWidth} />

      <NodeColorPicker node={scoreStrokeColor} />

      <NodeColorPicker node={cutStrokeColor} />

      <NodeColorPicker node={registrationStrokeColor} />

      <Divider />

      <NodeRadio node={printRegistrationType} />

      <NodeNumberTextInput node={preferences.registrationPadding} />

      <NodeNumberTextInput node={preferences.registrationMarkLength} />

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
