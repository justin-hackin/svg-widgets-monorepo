import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@material-ui/core';
import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { PanelColorPicker } from '../../../../../common/components/PanelColorPicker';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { PanelSwitch } from '../../../../../common/components/PanelSwitch';

export const PreferencesControls = observer(() => {
  const { preferences, resetPreferences } = useWorkspaceMst();
  return (
    <>
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
