import React from 'react';
import { observer } from 'mobx-react';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { PanelColorPicker } from '../../../../common/components/PanelColorPicker';
import { usePreferencesMst } from '../../../models';

export const StyleControls = observer(() => {
  const preferences = usePreferencesMst();
  return (
    <>
      <PanelSlider
        value={preferences.dieLineSettings.strokeWidth}
        setter={(val) => { preferences.dieLineSettings.strokeWidth = val; }}
        valuePath="preferences.dieLineSettings.strokeWidth"
        label="Dieline Stroke"
        min={0}
        max={3}
        step={0.01}
      />
      <PanelColorPicker
        label="Cut Stroke Color"
        valuePath="preferences.cutSettings.stroke"
        value={preferences.cutSettings.stroke}
        setter={(val) => { preferences.cutSettings.stroke = val; }}
      />
      <PanelColorPicker
        label="Score Stroke Color"
        valuePath="preferences.scoreSettings.stroke"
        value={preferences.scoreSettings.stroke}
        setter={(val) => { preferences.scoreSettings.stroke = val; }}
      />
      <PanelColorPicker
        label="Design Boundary Stroke Color"
        valuePath="preferences.designBoundarySettings.stroke"
        value={preferences.designBoundarySettings.stroke}
        setter={(val) => { preferences.designBoundarySettings.stroke = val; }}
      />
    </>
  );
});
