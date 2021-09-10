import { Slider, Tooltip, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import uuid from 'uuid/v1';

import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../renderer/DielineViewer/models/WorkspaceModel';
import { UNIT_LABEL_FORMAT, UNIT_STEP } from './util/units';
import { getNearestHistoryFromAncestorNode } from './util/mobx-keystone';
import { useStyles } from './style/style';
import {ControllablePrimitiveModel, INPUT_TYPE, SliderMetadata} from './util/controllable-property';

const ValueLabelComponent = ({
  children,
  open,
  value,
}) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

export const ControlledSlider = ({
  className, value, min, max, step, valueLabelFormat, valuePath, onChange, onChangeCommitted, labelId,
}) => (
  <Slider
    className={className}
    value={value}
    onChange={onChange}
    onChangeCommitted={onChangeCommitted}
    min={min}
    max={max}
    step={step}
    valueLabelFormat={valueLabelFormat}
    name={valuePath}
    key={valuePath}
    aria-labelledby={labelId}
    valueLabelDisplay="auto"
    ValueLabelComponent={ValueLabelComponent}
  />
);

export const NodeSlider = observer(({
  node, className = undefined, useUnits = false,
}: { node: ControllablePrimitiveModel<number, SliderMetadata>, className?: string, useUnits?: boolean }) => {
  const { preferences: { displayUnit } } = useWorkspaceMst();
  const [historyGroup, setHistoryGroup] = useState(null);
  const [history] = useState(getNearestHistoryFromAncestorNode(node));
  const classes = useStyles();

  const { min, max, step } = node.metadata;
  const labelId = uuid();

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
  // @ts-ignore
  if (node.metadata.type !== INPUT_TYPE.SLIDER) {
    throw new Error(`Slider node must have metadata.type as "slider", saw: ${node.metadata.type}`);
  }
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <ControlledSlider
        className={className}
        value={node.value}
        onChange={(_, val) => {
          if (!history) {
            node.setValue(val);
            return;
          }
          getHistoryGroup().continue(() => {
            node.setValue(val);
          });
        }}
        onChangeCommitted={history && (() => {
          if (historyGroup) {
            endHistoryGroupAndClear();
          }
        })}
        step={step || (useUnits && UNIT_STEP[displayUnit])}
        valueLabelFormat={useUnits ? UNIT_LABEL_FORMAT[displayUnit] : undefined}
        valuePath={node.valuePath}
        labelId={labelId}
        min={min}
        max={max}
      />
    </div>
  );
});
