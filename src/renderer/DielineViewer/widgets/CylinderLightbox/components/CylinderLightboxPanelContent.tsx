import React from 'react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { useStyles } from '../../../../../common/style/style';
import { CylinderLightBoxModel } from '../models';
import { NodeSliderOrTextInput } from '../../../../../common/components/NodeSliderOrTextInput';
import { NodeSlider } from '../../../../../common/NodeSlider';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { shapeDefinition } = workspaceStore.selectedStore as CylinderLightBoxModel;

  return (
    <div className={classes.tabContent}>
      <NodeSlider node={shapeDefinition.arcsPerRing} />
      <NodeSlider node={shapeDefinition.wallsPerArc} />
      <NodeSlider node={shapeDefinition.holderTabsPerArc} />
      <NodeSliderOrTextInput node={shapeDefinition.materialThickness} />
      <NodeSliderOrTextInput node={shapeDefinition.cylinderHeight} />

      <NodeSliderOrTextInput node={shapeDefinition.ringRadius} />
      <NodeSliderOrTextInput node={shapeDefinition.ringThicknessRatio} />
      <NodeSliderOrTextInput node={shapeDefinition.dovetailIngressRatio} />
      <NodeSliderOrTextInput node={shapeDefinition.dovetailSizeRatio} />
      <NodeSliderOrTextInput node={shapeDefinition.holderTabsFeetLengthRatio} />
    </div>
  );
};
