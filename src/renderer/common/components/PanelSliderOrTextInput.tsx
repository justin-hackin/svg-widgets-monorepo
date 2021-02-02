import { startCase, last } from 'lodash';
import uuid from 'uuid/v1';
import React, { useState } from 'react';
import {
  Tooltip, Typography, Slider, FormControl, Input, IconButton,
} from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import KeyboardIcon from '@material-ui/icons/Keyboard';

import { useStyles } from '../../DielineViewer/style';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

const ValueLabelComponent = ({ children, open, value }) => (
  <Tooltip open={open} enterTouchDelay={0} placement="top" title={value} arrow>
    {children}
  </Tooltip>
);

// TODO: fix value label cut off and wrong color
// convert to slider with text input? could allow escaping bounds
export const PanelSliderOrTextInput = ({
  value, onChange, onChangeCommitted, valuePath,
  min, max, step, enableTextToggle = true, label = undefined, valueLabelFormat = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const elementLabel = label || getLabelFromValuePath(valuePath);
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };

  const TextInputComponent = (
    <Input
      defaultValue={value}
      type="number"
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          const parsedFloat = parseFloat((e.target as HTMLInputElement).value);
          if (!Number.isNaN(parsedFloat)) {
            onChange(null, parsedFloat);
            onChangeCommitted();
          }
        }
      }}
      inputProps={{ 'aria-label': labelId }}
    />
  );

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
          {(isSlider || enableTextToggle === false) ? SliderComponent : TextInputComponent }
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
