import { Slider, Tooltip, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import uuid from 'uuid/v1';

import { observer } from 'mobx-react';
import { useWorkspaceMst } from '../renderer/DielineViewer/models/WorkspaceModel';
import { UNIT_LABEL_FORMAT, UNIT_STEP } from './util/units';
import { getNearestHistoryFromAncestorNode } from './util/mobx-keystone';
import { useStyles } from './style/style';
import { ControllablePrimitiveModel } from './keystone-tweakables/models/ControllablePrimitiveModel';
import { INPUT_TYPE, SliderMetadata, SliderWithTextMetadata } from './keystone-tweakables/types';

const ValueLabelComponent = ({
  children,
  open,
  value,
}) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

export const UnlabelledNodeSlider = observer(({
  node, className, labelId,
}: {
  node: ControllablePrimitiveModel<number, SliderMetadata | SliderWithTextMetadata>, labelId: string, className?: string
}) => {
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const [historyGroup, setHistoryGroup] = useState(null);
  const [history] = useState(getNearestHistoryFromAncestorNode(node));

  const {
    metadata: {
    // @ts-ignore
      min, max, step, useUnits = undefined,
    }, valuePath,
  } = node;

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
        if (Array.isArray(val)) { return; }
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
      valueLabelFormat={useUnits ? UNIT_LABEL_FORMAT[displayUnit] : undefined}
      name={valuePath}
      min={min}
      max={max}
      step={step || (useUnits && UNIT_STEP[displayUnit])}
      key={valuePath}
      aria-labelledby={labelId}
      valueLabelDisplay="auto"
      ValueLabelComponent={ValueLabelComponent}

    />
  );
});

export const NodeSlider = observer(({
  node, className = undefined,
}: { node: ControllablePrimitiveModel<number, SliderMetadata>, className?: string, useUnits?: boolean }) => {
  const classes = useStyles();
  const labelId = uuid();

  // @ts-ignore
  if (node.metadata.type !== INPUT_TYPE.SLIDER) {
    throw new Error(`Slider node must have metadata.type as "slider", saw: ${node.metadata.type}`);
  }
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>
      <UnlabelledNodeSlider
        className={className}
        node={node}
        labelId={labelId}
      />
    </div>
  );
});
