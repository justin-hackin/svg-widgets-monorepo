import { Slider, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { INPUT_TYPE, SliderMetadata, SliderWithTextMetadata } from '../types';
import { getNearestHistoryFromAncestorNode } from '../../util/mobx-keystone';
import { UNIT_LABEL_FORMAT, UNIT_STEP } from '../../util/units';
import { useWorkspaceMst } from '../../../WidgetWorkspace/rootStore';

function ValueLabelComponent({
  children,
  open,
  value,
}) {
  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
      {children}
    </Tooltip>
  );
}
export const TweakableUnlabelledSlider = observer(({
  node,
  className,
  labelId,
}: {
  node: TweakablePrimitiveModel<number, SliderMetadata | SliderWithTextMetadata>, labelId: string, className?: string
}) => {
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const [historyGroup, setHistoryGroup] = useState(null);
  const [history] = useState(getNearestHistoryFromAncestorNode(node));

  const {
    metadata: {
      min, max, step,
    },
    valuePath,
  } = node;
  const useUnits = node.metadata.type === INPUT_TYPE.SLIDER_WITH_TEXT && node.metadata.useUnits;

  const endHistoryGroupAndClear = () => {
    historyGroup.end();
    setHistoryGroup(null);
  };

  const getHistoryGroup = () => {
    if (!historyGroup) {
      const group = history.createGroup();
      setHistoryGroup(group);
      return group;
    }
    return historyGroup;
  };
  return (
    <Slider
      className={className}
      value={node.value}
      onChange={(_, val) => {
        if (Array.isArray(val)) {
          return;
        }
        if (!history) {
          node.setValue(val);
          return;
        }
        getHistoryGroup()
          .continue(() => {
            node.setValue(val);
          });
      }}
      onChangeCommitted={history && (() => {
        if (historyGroup) {
          endHistoryGroupAndClear();
        }
      })}
      components={{
        ValueLabel: ValueLabelComponent,
      }}
      valueLabelFormat={useUnits ? UNIT_LABEL_FORMAT[displayUnit] : undefined}
      name={valuePath}
      min={min}
      max={max}
      step={step || (useUnits && UNIT_STEP[displayUnit])}
      key={valuePath}
      aria-labelledby={labelId}
      valueLabelDisplay="auto"

    />
  );
});
