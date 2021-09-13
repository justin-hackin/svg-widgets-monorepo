import React from 'react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { useStyles } from '../../../../../common/style/style';
import { CylinderLightBoxModel } from '../models';
import { NodeSliderOrTextInput } from '../../../../../common/components/NodeSliderOrTextInput';
import { NodeSlider } from '../../../../../common/NodeSlider';
import { TweakableInput } from '../../../../../common/components/TweakableInput';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { shapeDefinition } = workspaceStore.selectedStore as CylinderLightBoxModel;

  return (
    <div className={classes.tabContent}>
      <TweakableInput node={shapeDefinition.arcsPerRing} />
      <TweakableInput node={shapeDefinition.wallsPerArc} />
      <TweakableInput node={shapeDefinition.holderTabsPerArc} />
      <TweakableInput node={shapeDefinition.materialThickness} />
      <TweakableInput node={shapeDefinition.cylinderHeight} />

      <TweakableInput node={shapeDefinition.ringRadius} />
      <TweakableInput node={shapeDefinition.ringThicknessRatio} />
      <TweakableInput node={shapeDefinition.dovetailIngressRatio} />
      <TweakableInput node={shapeDefinition.dovetailSizeRatio} />
      <TweakableInput node={shapeDefinition.holderTabsFeetLengthRatio} />
    </div>
  );
};
