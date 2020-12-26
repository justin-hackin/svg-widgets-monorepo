import React from 'react';
import { observer } from 'mobx-react';

import { PanelSlider } from '../../../../../common/components/PanelSlider';
import { ratioSliderProps } from './constants';
import { PanelSwitch } from '../../../../../common/components/PanelSwitch';
import { VERY_SMALL_NUMBER } from '../../../../../common/constants';
import { ControlElement } from '../../../../../common/components/ControlElement';
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
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="roundingDistanceRatio"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSwitch}
        node={baseEdgeTabsSpec}
        property="scoreTabMidline"
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="finDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="tabDepthToAscendantTabDepth"
        min={0.6}
        max={2}
        step={VERY_SMALL_NUMBER}
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="holeDepthToTabDepth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="finOffsetRatio"
        {...ratioSliderProps}
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="holeBreadthToHalfWidth"
        {...{ ...ratioSliderProps, min: 0.05 }}
      />
      <ControlElement
        component={PanelSlider}
        node={baseEdgeTabsSpec}
        property="holeTaper"
        min={Math.PI / 8}
        max={Math.PI / 3}
        step={VERY_SMALL_NUMBER}
      />
      <PanelSwitch
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
          <ControlElement
            component={PanelSlider}
            node={bendGuideValley}
            property="depthRatio"
            {...ratioSliderProps}
          />
          <ControlElement
            component={PanelSlider}
            node={bendGuideValley}
            property="theta"
            min={Math.PI / 16}
            max={Math.PI / 3}
            step={VERY_SMALL_NUMBER}
          />
        </>
      )}
    </>
  );
});
