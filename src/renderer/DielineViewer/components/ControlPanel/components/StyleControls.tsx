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
        value={preferences.dieLineProps.strokeWidth}
        setter={(val) => { preferences.dieLineProps.strokeWidth = val; }}
        valuePath="preferences.dieLineProps.strokeWidth"
        label="Dieline Stroke"
        min={0}
        max={3}
        step={0.01}
      />
      <PanelColorPicker
        label="Cut Stroke Color"
        valuePath="preferences.cutLineProps.stroke"
        value={preferences.cutLineProps.stroke}
        setter={(val) => { preferences.cutLineProps.stroke = val; }}
      />
      <PanelColorPicker
        label="Score Stroke Color"
        valuePath="preferences.scoreLineProps.stroke"
        value={preferences.scoreLineProps.stroke}
        setter={(val) => { preferences.scoreLineProps.stroke = val; }}
      />
      <PanelColorPicker
        label="Design Boundary Stroke Color"
        valuePath="preferences.designBoundaryProps.stroke"
        value={preferences.designBoundaryProps.stroke}
        setter={(val) => { preferences.designBoundaryProps.stroke = val; }}
      />
    </>
  );
});
