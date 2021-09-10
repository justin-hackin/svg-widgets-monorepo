import React from 'react';
import { observer } from 'mobx-react';
import { Button, Divider } from '@material-ui/core';

import { startCase } from 'lodash';
import { PanelSliderOrTextInput } from '../../../../../../common/components/PanelSliderOrTextInput';
import { PanelColorPicker } from '../../../../../../common/components/PanelColorPicker';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PanelTextInput } from '../../../../../../common/components/PanelTextInput';
import { PanelRadio } from '../../../../../../common/components/PanelRadio';
import { UNITS } from '../../../../../../common/util/units';
import { PRINT_REGISTRATION_TYPES } from '../../../../models/PreferencesModel';
import { NodeSwitch } from '../../../../../../common/components/NodeSwitch';

export const PreferencesControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { preferences } = workspaceStore;
  const options = Object.keys(UNITS).map((unit) => ({ value: unit, label: unit }));
  return (
    <>
      <PanelRadio
        row
        node={preferences}
        property="displayUnit"
        options={options}
      />
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
      <PanelColorPicker
        node={preferences}
        property="scoreStrokeColor"
      />

      <PanelColorPicker
        node={preferences}
        property="cutStrokeColor"
      />
      <Divider />
      <PanelRadio
        node={preferences}
        property="printRegistrationType"
        options={
          Object.values(PRINT_REGISTRATION_TYPES)
            .map((value) => ({ value, label: startCase(value) }))
        }
      />
      <PanelColorPicker
        node={preferences}
        property="registrationStrokeColor"
      />

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
