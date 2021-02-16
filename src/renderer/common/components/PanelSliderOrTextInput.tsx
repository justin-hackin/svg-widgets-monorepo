import { last, startCase } from 'lodash';
import uuid from 'uuid/v1';
import React, { useState } from 'react';
import { FormControl, IconButton, Typography } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { observer } from 'mobx-react';

import { useStyles } from '../../DielineViewer/style';
import { SubmittableTextInput } from './SubmittableTextInput';
import { mstDataToProps } from '../util/mst';
import { UnlabeledPanelSliderComponent } from './PanelSliderComponent';
import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';

export const PanelSliderOrTextInput = observer(({
  node, property, min, max, step = undefined, useUnits = false, className = undefined, label = undefined,
}) => {
  const classes = useStyles();
  const labelId = uuid();
  const {
    setValue, valuePath, value,
  } = mstDataToProps(node, property);
  const { preferences: { displayUnit } } = useWorkspaceMst();
  const resolvedLabel = `${label || startCase(property)}${useUnits ? ` (${displayUnit})` : ''}`;
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };

  return (
    <FormControl className={`${classes.formControl} ${className}`}>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>
      <div className={classes.sliderTextInputContainer}>
        <div className={classes.sliderTextInput}>
          {(isSlider) ? (
            <UnlabeledPanelSliderComponent {...{
              node, property, min, max, step, unit: useUnits ? displayUnit : undefined, labelId,
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
});
