import uuid from 'uuid/v1';
import React, { useState } from 'react';
import { FormControl, IconButton, Typography } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import { observer } from 'mobx-react';
import clsx from 'clsx';

import { useStyles } from '../style/style';
import { NodeUnlabelledNumberTextInput } from './NodeUnlabelledNumberTextInput';
import { useWorkspaceMst } from '../../renderer/DielineViewer/models/WorkspaceModel';
import { UnlabelledNodeSlider } from '../NodeSlider';
import { ControllablePrimitiveModel } from '../keystone-tweakables/models/ControllablePrimitiveModel';
import { SliderWithTextMetadata } from '../keystone-tweakables/types';

export const NodeSliderOrTextInput = observer(({
  node, className = undefined,
}: { node: ControllablePrimitiveModel<number, SliderWithTextMetadata>, className?: string }) => {
  const classes = useStyles();
  const labelId = uuid();
  const { label, metadata: { useUnits } } = node;
  const { preferences: { displayUnit: { value: displayUnit } } } = useWorkspaceMst();
  const resolvedLabel = `${label}${useUnits ? ` (${displayUnit})` : ''}`;
  const [isSlider, setIsSlider] = useState(true);
  const toggleIsSlider = () => { setIsSlider(!isSlider); };

  return (
    <FormControl className={clsx(className, classes.formControl)}>
      <Typography id={labelId} gutterBottom>
        {resolvedLabel}
      </Typography>
      <div className={classes.sliderTextInputContainer}>
        <div className={classes.sliderTextInput}>
          {(isSlider) ? (
            <UnlabelledNodeSlider node={node} labelId={labelId} />
          ) : (
            <NodeUnlabelledNumberTextInput node={node} labelId={labelId} />
          ) }
        </div>
        <IconButton className={classes.sliderTextInputToggle} onClick={toggleIsSlider}>
          {isSlider ? (<KeyboardIcon />) : (<TuneIcon />)}
        </IconButton>
      </div>
    </FormControl>
  );
});
