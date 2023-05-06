import React from 'react';
import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';
import { SimpleSwitch } from '../../../common/keystone-tweakables/material-ui-controls/SimpleSwitch';
import { TweakableChildrenInputs }
  from '../../../common/keystone-tweakables/material-ui-controls/TweakableChildrenInputs';

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const selectedStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { useDottedStroke, interFaceScoreDashSpec, baseScoreDashSpec } = selectedStore;

  return (
    <>
      <SimpleSwitch
        value={useDottedStroke}
        name="useDottedStroke"
        onChange={(e) => { selectedStore.setUseDottedStroke(e.target.checked); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>
          {/* TODO: add headers, consider computed labelOverride */}
          <TweakableChildrenInputs parentNode={interFaceScoreDashSpec} />
          <TweakableChildrenInputs parentNode={baseScoreDashSpec} />

        </>
      )}
    </>
  );
});
