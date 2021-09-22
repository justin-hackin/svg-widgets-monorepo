import React from 'react';

import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { useStyles } from '../../../common/style/style';
import { CylinderLightboxWidgetModel } from '../models';
import { TweakableInput }
  from '../../../common/keystone-tweakables/material-ui-controls/TweakableInput';

export const CylinderLightboxPanelContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { savedModel } = workspaceStore.selectedStore as CylinderLightboxWidgetModel;

  return (
    <div className={classes.tabContent}>
      <TweakableInput node={savedModel.arcsPerRing} />
      <TweakableInput node={savedModel.wallsPerArc} />
      <TweakableInput node={savedModel.holderTabsPerArc} />
      <TweakableInput node={savedModel.materialThickness} />
      <TweakableInput node={savedModel.cylinderHeight} />

      <TweakableInput node={savedModel.ringRadius} />
      <TweakableInput node={savedModel.ringThicknessRatio} />
      <TweakableInput node={savedModel.dovetailIngressRatio} />
      <TweakableInput node={savedModel.dovetailSizeRatio} />
      <TweakableInput node={savedModel.holderTabsFeetLengthRatio} />
    </div>
  );
};
