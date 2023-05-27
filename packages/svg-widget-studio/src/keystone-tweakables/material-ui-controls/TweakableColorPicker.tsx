import React from 'react';
import { v1 as uuid } from 'uuid';
import Typography from '@mui/material/Typography';
import { ChromePicker } from 'react-color';
import { observer } from 'mobx-react';
import { styled } from '@mui/styles';
import { TweakablePrimitiveModel } from '../models/TweakablePrimitiveModel';
import { ColorPickerMetadata } from '../types';
import { FormControlStyled } from '../../style';

const classes = {
  panelChromePicker: 'tweakable-color-picker__panel-chrome-picker',
};

const ThisFormControl = styled(FormControlStyled)(({ theme }) => ({
  [`& .${classes.panelChromePicker}`]: {
    alignSelf: 'flex-end',
    // yes its dirty but component uses style attributes, forcing the dreaded!
    background: `${theme.palette.background.paper} !important`,
  },
}));

export const TweakableColorPicker = observer(({
  node, className,
}: { node: TweakablePrimitiveModel<string, ColorPickerMetadata>, className?: string }) => {
  const labelId = uuid();

  return (
    <ThisFormControl className={className}>
      <Typography id={labelId} gutterBottom>
        {node.label}
      </Typography>

      <ChromePicker
        className={classes.panelChromePicker}
        name={labelId}
        color={node.value}
        onChangeComplete={(color) => {
          node.setValue(color.hex);
        }}
      />
    </ThisFormControl>
  );
});
