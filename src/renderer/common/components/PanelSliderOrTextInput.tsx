import { last, startCase } from 'lodash';
import uuid from 'uuid/v1';
import React, { useState } from 'react';
import { FormControl, IconButton, Typography } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import KeyboardIcon from '@material-ui/icons/Keyboard';

import { useStyles } from '../../DielineViewer/style';
import { SubmittableTextInput } from './SubmittableTextInput';
import { mstDataToProps } from '../util/mst';
import { UnlabeledPanelSliderComponent } from './PanelSliderComponent';

export const getLabelFromValuePath = (valuePath) => startCase(last((valuePath.split('.'))));

export const PanelSliderOrTextInput = ({
  node, property, min, max, step = undefined, className = undefined, label = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const {
    setValue, valuePath, value, label: computedLabel, useUnits,
  } = mstDataToProps(node, property, label);
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };

  return (
    <FormControl className={`${classes.formControl} ${className}`}>
      <Typography id={labelId} gutterBottom>
        {label || computedLabel}
      </Typography>
      <div className={classes.sliderTextInputContainer}>
        <div className={classes.sliderTextInput}>
          {(isSlider) ? (
            <UnlabeledPanelSliderComponent {...{
              node, property, min, max, step, labelId,
            }}
            />
          ) : (
            <SubmittableTextInput
              useUnits={useUnits}
              value={value}
              setValue={setValue}
              valuePath={valuePath}
              labelId={labelId}
            />
          ) }
        </div>
        <IconButton className={classes.sliderTextInputToggle} onClick={toggleIsSlider}>
          {isSlider ? (<KeyboardIcon />) : (<TuneIcon />)}
        </IconButton>
      </div>
    </FormControl>
  );
};
