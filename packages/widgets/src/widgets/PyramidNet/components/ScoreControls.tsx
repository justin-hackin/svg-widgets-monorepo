import React from 'react';
import { observer } from 'mobx-react';
import { SimpleSwitch, TweakableChildrenInputs, useWorkspaceMst } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const selectedStore = workspaceStore.selectedStore as unknown as PyramidNetWidgetModel;
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
          <TweakableChildrenInputs parentNode={interFaceScoreDashSpec} />
          <TweakableChildrenInputs parentNode={baseScoreDashSpec} />

        </>
      )}
    </>
  );
});
