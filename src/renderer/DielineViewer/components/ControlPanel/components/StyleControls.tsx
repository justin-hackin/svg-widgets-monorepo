import React from 'react';
import { observer } from 'mobx-react';
import { PanelSlider } from '../../../../common/components/PanelSlider';
import { PanelColorPicker } from '../../../../common/components/PanelColorPicker';
import { useMst } from '../../../models';

export const StyleControls = observer(() => {
  const store = useMst();
  const { styleSpec } = store;

  return (
    <>
      <PanelSlider
        value={styleSpec.dieLineProps.strokeWidth}
        setter={(val) => { styleSpec.dieLineProps.strokeWidth = val; }}
        valuePath="styleSpec.dieLineProps.strokeWidth"
        label="Dieline Stroke"
        min={0}
        max={3}
        step={0.01}
      />
      <PanelColorPicker
        label="Cut Stroke Color"
        valuePath="styleSpec.cutLineProps.stroke"
        value={styleSpec.cutLineProps.stroke}
        setter={(val) => { styleSpec.cutLineProps.stroke = val; }}
      />
      <PanelColorPicker
        label="Score Stroke Color"
        valuePath="styleSpec.scoreLineProps.stroke"
        value={styleSpec.scoreLineProps.stroke}
        setter={(val) => { styleSpec.scoreLineProps.stroke = val; }}
      />
      <PanelColorPicker
        label="Design Boundary Fill"
        valuePath="styleSpec.designBoundaryProps.fill"
        value={styleSpec.designBoundaryProps.fill}
        setter={(val) => { styleSpec.designBoundaryProps.fill = val; }}
      />
    </>
  );
});
