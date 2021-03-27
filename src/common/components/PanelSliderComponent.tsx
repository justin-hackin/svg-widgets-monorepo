import { Slider, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import uuid from 'uuid/v1';
import { startCase } from 'lodash';

import { observer } from 'mobx-react';
import { getHistory, mstDataToProps } from '../util/mst';
import { useStyles } from '../../renderer/DielineViewer/style';
import { useWorkspaceMst } from '../../renderer/DielineViewer/models/WorkspaceModel';
import { UNIT_LABEL_FORMAT, UNIT_STEP } from '../util/units';

const ValueLabelComponent = ({
  children,
  open,
  value,
}) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

export const UnlabeledPanelSliderComponent = observer(({
  node,
  property,
  min,
  max,
  step,
  labelId,
  unit = undefined,
  className = undefined,
  disabled = false,
}) => {
  const {
    value, setValue, valuePath,
  } = mstDataToProps(node, property);
  const history = getHistory(node);
  return (
    <Slider
      className={className}
      value={value}
      onChange={(_, val) => {
        if (history && !history.groupActive) {
          history.startGroup(() => {
          });
        }
        setValue(val);
      }}
      onChangeCommitted={history && (() => {
        history.stopGroup();
      })}
      step={step || (unit && UNIT_STEP[unit])}
      valueLabelFormat={unit ? UNIT_LABEL_FORMAT[unit] : undefined}
      name={valuePath}
      key={valuePath}
      aria-labelledby={labelId}
      valueLabelDisplay="auto"
      ValueLabelComponent={ValueLabelComponent}
      disabled={disabled}
      {...{
        min,
        max,
      }}
    />
  );
});

export const PanelSliderComponent = observer(({
  node,
  property,
  min,
  max,
  disabled = false,
  useUnits = false,
  className = undefined,
  step = undefined,
  label = undefined,
}) => {
  const labelId = uuid();
  const { preferences: { displayUnit } } = useWorkspaceMst();
  const resolvedLabel = `${label || startCase(property)}${useUnits ? ` (${displayUnit})` : ''}`;
  const classes = useStyles();
  return (
    <div className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>
      <UnlabeledPanelSliderComponent {...{
        node,
        property,
        min,
        max,
        step,
        unit: useUnits ? displayUnit : undefined,
        labelId,
        className,
        disabled,
      }}
      />
    </div>
  );
});
