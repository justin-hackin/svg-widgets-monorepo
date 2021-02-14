import { Slider, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import uuid from 'uuid/v1';

import { observer } from 'mobx-react';
import { getHistory, mstDataToProps } from '../util/mst';
import { CURRENT_UNIT, UNIT_LABEL_FORMAT, UNIT_STEP } from '../util/geom';
import { useStyles } from '../../DielineViewer/style';

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
  useUnits = false,
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
      step={step || (useUnits && UNIT_STEP[CURRENT_UNIT])}
      valueLabelFormat={useUnits ? UNIT_LABEL_FORMAT[CURRENT_UNIT] : undefined}
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
  const { label: resolvedLabel } = mstDataToProps(node, property, label, useUnits);
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
        labelId,
        className,
        disabled,
      }}
      />
    </div>
  );
});
