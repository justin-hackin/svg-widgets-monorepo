import React from 'react';
import { observer } from 'mobx-react';

import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { PanelSwitch, PanelSwitchUncontrolled } from '../../../../../common/components/PanelSwitch';
import { DEFAULT_SLIDER_STEP } from '../../../../../common/constants';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../../models/PyramidNetMakerStore';

export const BaseEdgeTabControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const {
    pyramidNetSpec: {
      baseEdgeTabsSpec,
    } = {},
  } = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const {
    bendGuideValley,
    unsetBendGuideValley,
    resetBendGuideValleyToDefault,
  } = baseEdgeTabsSpec;

  return (
    <>
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="roundingDistanceRatio"
        {...ratioSliderProps}
      />
      <PanelSwitch
        node={baseEdgeTabsSpec}
        property="scoreTabMidline"
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="finDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="tabDepthToAscendantTabDepth"
        min={0.6}
        max={2}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="holeDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="finOffsetRatio"
        {...ratioSliderProps}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="holeBreadthToHalfWidth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="holeTabClearance"
        min={0}
        max={0.1}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="holeTaper"
        min={Math.PI / 8}
        max={Math.PI / 3}
        step={DEFAULT_SLIDER_STEP}
      />
      <PanelSliderOrTextInput
        node={baseEdgeTabsSpec}
        property="tabConjunctionClearance"
        min={0.05}
        max={0.4}
        step={0.01}
      />
      <PanelSwitchUncontrolled
        label="Use Bend Guide Valley"
        valuePath="BaseEdgeTabControls__useBendGuideValley"
        value={!!bendGuideValley}
        onChange={(e) => {
          if (e.target.checked) {
            resetBendGuideValleyToDefault();
          } else {
            unsetBendGuideValley();
          }
        }}
      />
      {baseEdgeTabsSpec.bendGuideValley && (
        <>
          <PanelSliderOrTextInput
            node={bendGuideValley}
            property="depthRatio"
            {...ratioSliderProps}
          />
          <PanelSliderOrTextInput
            node={bendGuideValley}
            property="theta"
            min={Math.PI / 16}
            max={Math.PI / 3}
            step={DEFAULT_SLIDER_STEP}
          />
        </>
      )}
    </>
  );
});
