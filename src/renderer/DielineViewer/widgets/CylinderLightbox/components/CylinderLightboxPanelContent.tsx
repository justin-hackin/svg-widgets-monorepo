import React from 'react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { ICylinderLightBoxModel } from '../models';
import { CM_TO_PIXELS_RATIO } from '../../../../common/util/geom';
import { PanelSliderOrTextInput } from '../../../../common/components/PanelSliderOrTextInput';
import { PanelSliderComponent } from '../../../../common/components/PanelSliderComponent';
import { DEFAULT_SLIDER_STEP } from '../../../../common/constants';
import { useStyles } from '../../../style';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { shapeDefinition } = workspaceStore.selectedStore as ICylinderLightBoxModel;

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
        property="materialThickness__PX"
        min={CM_TO_PIXELS_RATIO * 0.1}
        max={CM_TO_PIXELS_RATIO}
      />
      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="cylinderHeight__PX"
        min={CM_TO_PIXELS_RATIO}
        max={CM_TO_PIXELS_RATIO * 30}
        step={0.1 * CM_TO_PIXELS_RATIO}
      />

      <PanelSliderOrTextInput
        node={shapeDefinition}
        property="ringRadius__PX"
        min={CM_TO_PIXELS_RATIO * 10}
        max={CM_TO_PIXELS_RATIO * 60}
        step={0.25 * CM_TO_PIXELS_RATIO}
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
