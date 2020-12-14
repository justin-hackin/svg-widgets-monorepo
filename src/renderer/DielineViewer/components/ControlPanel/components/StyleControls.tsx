import React from 'react';
import { observer } from 'mobx-react';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { PanelColorPicker } from '../../../../common/components/PanelColorPicker';
import { usePreferencesMst } from '../../../models';
import { ControlElement } from '../../../../common/components/ControlElement';

export const StyleControls = observer(() => {
  const preferences = usePreferencesMst();
  return (
    <>
      <ControlElement
        component={PanelSlider}
        node={preferences.dieLineSettings}
        property="strokeWidth"
        label="Dieline Stroke"
        min={0}
        max={3}
        step={0.01}
      />
      <ControlElement
        component={PanelColorPicker}
        node={preferences.cutSettings}
        property="stroke"
        label="Cut Stroke Color"
      />
      <ControlElement
        component={PanelColorPicker}
        node={preferences.scoreSettings}
        property="stroke"
        label="Score Stroke Color"
      />
      <ControlElement
        component={PanelColorPicker}
        node={preferences.designBoundarySettings}
        property="stroke"
        label="Design Boundary Stroke Color"
      />
    </>
  );
});
