import React from 'react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { PanelSliderComponent } from '../../../../../common/components/PanelSliderComponent';
import { useStyles } from '../../../../../common/style/style';
import { PIXELS_PER_CM } from '../../../../../common/util/units';
import { DEFAULT_SLIDER_STEP } from '../../../../../common/constants';
import { CylinderLightBoxModel } from '../models';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { shapeDefinition } = workspaceStore.selectedStore as CylinderLightBoxModel;

  return (
    <div className={classes.tabContent}>
      <PanelSliderComponent
        node={shapeDefinition}
        property="arcsPerRing"
        min={2}
        max={16}
        step={1}
      />
      <PanelSliderComponent
        node={shapeDefinition}
        property="wallsPerArc"
        min={1}
        max={16}
        step={1}
      />
      <PanelSliderComponent
        node={shapeDefinition}
        property="holderTabsPerArc"
        min={1}
        max={16}
        step={1}
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="materialThickness"
        min={PIXELS_PER_CM * 0.1}
        max={PIXELS_PER_CM}
        useUnits
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="cylinderHeight"
        min={PIXELS_PER_CM}
        max={PIXELS_PER_CM * 30}
        step={0.1 * PIXELS_PER_CM}
        useUnits
      />

      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="ringRadius"
        min={PIXELS_PER_CM * 10}
        max={PIXELS_PER_CM * 60}
        step={0.25 * PIXELS_PER_CM}
        useUnits
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="ringThicknessRatio"
        min={0.1}
        max={0.5}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="dovetailIngressRatio"
        min={0}
        max={1}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="dovetailSizeRatio"
        min={0}
        max={1}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="holderTabsFeetLengthRatio"
        min={0}
        max={1}
        step={DEFAULT_SLIDER_STEP}
      />
    </div>
  );
};
