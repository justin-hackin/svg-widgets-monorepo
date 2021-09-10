import React from 'react';
import { observer } from 'mobx-react';
import { Button, Divider } from '@material-ui/core';
import { PanelSliderOrTextInput } from '../../../../../../common/components/PanelSliderOrTextInput';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PanelTextInput } from '../../../../../../common/components/PanelTextInput';
import { NodeSwitch } from '../../../../../../common/components/NodeSwitch';
import { NodeColorPicker } from '../../../../../../common/components/NodeColorPicker';
import { NodeRadio } from '../../../../../../common/components/NodeRadio';

export const PreferencesControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { preferences } = workspaceStore;
  return (
    <>
      <NodeRadio node={preferences.displayUnit} />

      <PanelTextInput label="Document Width" node={preferences.dielineDocumentDimensions} property="width" useUnits />
      <PanelTextInput label="Document Height" node={preferences.dielineDocumentDimensions} property="height" useUnits />
      <NodeSwitch node={preferences.useClonesForBaseTabs} />

      <NodeSwitch node={preferences.useClonesForDecoration} />

      <PanelSliderOrTextInput
        node={preferences}
        property="strokeWidth"
        label="Dieline Stroke Width"
        min={0}
        max={3}
        step={0.01}
      />

      <NodeColorPicker node={preferences.scoreStrokeColor} />

      <NodeColorPicker node={preferences.cutStrokeColor} />

      <NodeColorPicker node={preferences.registrationStrokeColor} />

      <Divider />

      <NodeRadio node={preferences.printRegistrationType} />

      <PanelTextInput node={preferences} property="registrationPadding" useUnits />

      <PanelTextInput node={preferences} property="registrationMarkLength" useUnits />

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
