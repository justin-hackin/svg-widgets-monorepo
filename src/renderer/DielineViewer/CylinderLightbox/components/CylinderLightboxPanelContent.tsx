import React from 'react';

import { useWorkspaceMst } from '../../models/WorkspaceModel';
import { ICylinderLightBoxModel } from '../models';
import { ControlElement } from '../../../common/components/ControlElement';
import { CM_TO_PIXELS_RATIO } from '../../../common/util/geom';
import { PanelSlider } from '../../../common/components/PanelSlider';
import { VERY_SMALL_NUMBER } from '../../../common/constants';
import { PanelSliderUnitView } from '../../../common/components/PanelSliderUnitView';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const { shapeDefinition } = workspaceStore.selectedStore as ICylinderLightBoxModel;

  return (
    <>
      <ControlElement
        component={PanelSliderUnitView}
        node={shapeDefinition}
        property="materialThickness"
        min={CM_TO_PIXELS_RATIO * 0.1}
        max={CM_TO_PIXELS_RATIO}
      />
      <ControlElement
        component={PanelSliderUnitView}
        node={shapeDefinition}
        property="ringRadius"
        min={CM_TO_PIXELS_RATIO * 10}
        max={CM_TO_PIXELS_RATIO * 60}
        step={0.25 * CM_TO_PIXELS_RATIO}
      />

      <ControlElement
        component={PanelSliderUnitView}
        node={shapeDefinition}
        property="cylinderHeight"
        min={CM_TO_PIXELS_RATIO}
        max={CM_TO_PIXELS_RATIO * 30}
        step={0.1 * CM_TO_PIXELS_RATIO}
      />

      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="ringThicknessRatio"
        min={0.1}
        max={0.5}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="arcsPerRing"
        min={2}
        max={16}
        step={1}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="wallsPerArc"
        min={1}
        max={16}
        step={1}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="dovetailIngressRatio"
        min={0}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="dovetailSizeRatio"
        min={0}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="holderTabsPerArc"
        min={1}
        max={16}
        step={1}
      />
      <ControlElement
        component={PanelSlider}
        node={shapeDefinition}
        property="holderTabsFeetLengthRatio"
        min={0}
        max={1}
        step={VERY_SMALL_NUMBER}
      />
    </>
  );
};
