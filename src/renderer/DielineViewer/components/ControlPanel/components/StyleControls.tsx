import React from 'react';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { PanelColorPicker } from '../../../../common/components/PanelColorPicker';
import { ControlElement } from './ControlElement';

export const StyleControls = () => (
  <>
    <ControlElement
      component={PanelSlider}
      valuePath="styleSpec.dieLineProps.strokeWidth"
      label="Dieline Stroke"
      min={0}
      max={3}
      step={0.01}
    />
    <ControlElement
      component={PanelColorPicker}
      label="Cut Stroke Color"
      valuePath="styleSpec.cutLineProps.stroke"
    />
    <ControlElement
      component={PanelColorPicker}
      label="Score Stroke Color"
      valuePath="styleSpec.scoreLineProps.stroke"
    />
    <ControlElement
      component={PanelColorPicker}
      label="Design Boundary Fill"
      valuePath="styleSpec.designBoundaryProps.fill"
    />
  </>
);
