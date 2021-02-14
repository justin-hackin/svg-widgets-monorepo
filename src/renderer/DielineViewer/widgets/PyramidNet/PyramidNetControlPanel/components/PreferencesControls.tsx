import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@material-ui/core';

import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { PanelColorPicker } from '../../../../../common/components/PanelColorPicker';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PanelSwitch } from '../../../../../common/components/PanelSwitch';
import { PanelTextInput } from '../../../../../common/components/PanelTextInput';
import { PanelRadio } from '../../../../../common/components/PanelRadio';
import { UNITS } from '../../../../../common/util/geom';

export const PreferencesControls = observer(() => {
  const { preferences, resetPreferences } = useWorkspaceMst();
  const options = Object.keys(UNITS).map((unit) => ({ value: unit, label: unit }));
  return (
    <>
      <PanelRadio
        node={preferences}
        property="displayUnit"
        options={options}
      />
      <PanelTextInput label="Document Width" node={preferences.dielineDocumentDimensions} property="width" />
      <PanelTextInput label="Document Height" node={preferences.dielineDocumentDimensions} property="height" />
      <PanelSwitch
        node={preferences}
        property="useClones"
      />
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
        label="Cut Stroke Color"
      />
      <PanelColorPicker
        node={preferences}
        property="cutStrokeColor"
        label="Score Stroke Color"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          resetPreferences();
        }}
      >
        Reset
      </Button>
    </>
  );
});
