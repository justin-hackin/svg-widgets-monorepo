import { last, startCase } from 'lodash';
import uuid from 'uuid/v1';
import React, { useState } from 'react';
import {
  FormControl, IconButton, Slider, Tooltip, Typography,
} from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import KeyboardIcon from '@material-ui/icons/Keyboard';

import { useStyles } from '../../DielineViewer/style';
import { SubmittableTextInput } from './SubmittableTextInput';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

const ValueLabelComponent = ({ children, open, value }) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

export const PanelSliderOrTextInput = ({
  value, onChange, onChangeCommitted, valuePath,
  min, max, step, enableTextToggle = true, label = undefined, valueLabelFormat = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const elementLabel = label || getLabelFromValuePath(valuePath);
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };
  const SliderComponent = (
    <Slider
      name={valuePath}
      value={value}
      aria-labelledby={labelId}
      valueLabelDisplay="auto"
      ValueLabelComponent={ValueLabelComponent}
      valueLabelFormat={
      valueLabelFormat || ((val) => val && val.toFixed(2))
    }
      {...{
        onChange, onChangeCommitted, min, max, step,
      }}
    />
  );

  return (
    <FormControl className={classes.formControl}>
      <Typography id={labelId} gutterBottom>
        {elementLabel}
      </Typography>
      <div className={classes.sliderTextInputContainer}>
        <div className={classes.sliderTextInput}>
          {(isSlider || enableTextToggle === false) ? SliderComponent : (
            <SubmittableTextInput {...{
              value,
              labelId,
              onChange: (e, parsedFloat) => {
                onChange(e, parsedFloat);
                onChangeCommitted();
              },
            }}
            />
          ) }
        </div>
        { enableTextToggle && (
          <IconButton className={classes.sliderTextInputToggle} onClick={toggleIsSlider}>
            {isSlider ? (<KeyboardIcon />) : (<TuneIcon />)}
          </IconButton>
        )}
      </div>
    </FormControl>
  );
};
