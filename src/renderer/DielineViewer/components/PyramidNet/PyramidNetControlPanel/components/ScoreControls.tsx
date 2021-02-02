import React from 'react';
import { observer } from 'mobx-react';

import { PanelSelect } from '../../../../../common/components/PanelSelect';
import { PanelSliderOrTextInput } from '../../../../../common/components/PanelSliderOrTextInput';
import { ratioSliderProps } from './constants';
import { PanelSwitch } from '../../../../../common/components/PanelSwitch';
import { VERY_SMALL_NUMBER } from '../../../../../common/constants';
import { ControlElement } from '../../../../../common/components/ControlElement';
import { useWorkspaceMst } from '../../../../models/WorkspaceModel';
import { IPyramidNetFactoryModel } from '../../../../models/PyramidNetMakerStore';

const strokeLengthProps = { min: 1, max: 100, step: VERY_SMALL_NUMBER };

export const ScoreControls = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const {
    pyramidNetSpec: {
      useDottedStroke, setUseDottedStroke,
      interFaceScoreDashSpec, baseScoreDashSpec, setInterFaceScoreDashSpecPattern, setBaseScoreDashSpecPattern,
    } = {}, dashPatterns,
  } = workspaceStore.selectedStore as IPyramidNetFactoryModel;
  const dashPatternOptions = dashPatterns.map(({ label, id }) => ({ value: id, label }));
  return (
    <>
      <PanelSwitch
        value={useDottedStroke}
        valuePath="pyramidNetSpec.useDottedStroke"
        onChange={(e) => { setUseDottedStroke(e.target.checked); }}
        label="Use dotted stroke"
      />
      {useDottedStroke && (
        <>
          <PanelSelect
            valuePath="pyramidNetSpec.interFaceScoreDashSpec.strokeDashPathPattern.id"
            value={interFaceScoreDashSpec.strokeDashPathPattern.id}
            label="Inter-face stroke dash pattern"
            onChange={(e) => {
              setInterFaceScoreDashSpecPattern(e.target.value);
            }}
            options={dashPatternOptions}
          />
          <ControlElement
            component={PanelSliderOrTextInput}
            node={interFaceScoreDashSpec}
            property="strokeDashLength"
            label="Inter-face Stroke Dash Length"
            {...strokeLengthProps}
          />
          <ControlElement
            component={PanelSliderOrTextInput}
            node={interFaceScoreDashSpec}
            property="strokeDashOffsetRatio"
            label="Inter-face Stroke Dash Offset Ratio"
            {...ratioSliderProps}
          />
          <PanelSelect
            valuePath="baseScoreDashSpec.strokeDashPathPattern.id"
            value={baseScoreDashSpec.strokeDashPathPattern.id}
            label="Base Stroke Dash Pattern"
            onChange={(e) => {
              setBaseScoreDashSpecPattern(e.target.value);
            }}
            options={dashPatternOptions}
          />
          <ControlElement
            component={PanelSliderOrTextInput}
            node={baseScoreDashSpec}
            property="strokeDashLength"
            label="Base Stroke Dash Length"
            {...strokeLengthProps}
          />
          <ControlElement
            component={PanelSliderOrTextInput}
            node={baseScoreDashSpec}
            property="strokeDashOffsetRatio"
            label="Base Stroke Dash Offset Ratio"
            {...ratioSliderProps}
          />
        </>
      )}
    </>
  );
});
