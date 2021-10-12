import uuid from 'uuid/v1';
import React, { useState } from 'react';
import { IconButton, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { observer } from 'mobx-react';

import { styled } from '@mui/styles';
import { MyFormControl } from '../../style/style';
import { TweakableUnlabelledNumberTextInput } from './TweakableUnlabelledNumberTextInput';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { SliderWithTextMetadata } from '../types';
import { TweakableUnlabelledSlider } from './TweakableUnlabelledSlider';

const classes = {
  inputContainer: 'input-container',
  textInputToggle: 'text-input-toggle',
  textInput: 'text-input',
};

const InputFormControl = styled(MyFormControl)(({ theme }) => ({
  [`& .${classes.inputContainer}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.textInputToggle}`]: {
    flex: '0 0 0',
  },
  [`& .${classes.textInput}`]: {
    flex: '1 0 0',
    paddingRight: theme.spacing(1),
  },
}));

export const TweakableSliderOrTextInput = observer(({
  node, className = undefined,
}: { node: TweakablePrimitiveModel<number, SliderWithTextMetadata>, className?: string }) => {
  const labelId = uuid();
  const { label, metadata: { useUnits } } = node;
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const resolvedLabel = `${label}${useUnits ? ` (${displayUnit})` : ''}`;
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };

  return (
    <InputFormControl className={className}>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>
      <div className={classes.inputContainer}>
        <div className={classes.textInput}>
          {(isSlider) ? (
            <TweakableUnlabelledSlider node={node} labelId={labelId} />
          ) : (
            <TweakableUnlabelledNumberTextInput node={node} labelId={labelId} />
          ) }
        </div>
        <IconButton
          className={classes.textInputToggle}
          onClick={toggleIsSlider}
          size="large"
        >
          {isSlider ? (<KeyboardIcon />) : (<TuneIcon />)}
        </IconButton>
      </div>
    </InputFormControl>
  );
});
