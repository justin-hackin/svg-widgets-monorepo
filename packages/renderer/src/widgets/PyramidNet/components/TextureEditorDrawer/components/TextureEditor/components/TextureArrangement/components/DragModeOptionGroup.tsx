import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/lab/ToggleButtonGroup/ToggleButtonGroup';
import CachedIcon from '@mui/icons-material/Cached';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import HeightIcon from '@mui/icons-material/Height';

import React from 'react';
import { observer } from 'mobx-react';
import { styled } from '@mui/styles';
import { DRAG_MODES } from '../../../models/ModifierTrackingModel';
import { TOUR_ELEMENT_CLASSES } from '../../../../../../../../../common/util/tour';

const extraButtonProps = {
  disableFocusRipple: true,
  disableRipple: true,
  style: { cursor: 'default' },
};
const classes = {
  rotateButton: 'drag-mode-rotate-button',
};

const MyToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  height: 'fit-content',
  margin: '0.5em',
  position: 'fixed',
  backgroundColor: '#373737',
  '& .MuiButtonBase-root': {
    '&:hover': {
      backgroundColor: 'initial',
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.grey.A700,
    },
  },
  [`& .${classes.rotateButton}`]: {
    transform: 'rotate(90deg)',
  },
}));

export const DragModeOptionsGroup = observer(({ dragMode }) => (
  <MyToggleButtonGroup
    className={TOUR_ELEMENT_CLASSES.DRAG_MODE_INDICATOR}
    value={dragMode}
    orientation="vertical"
    exclusive
    aria-label="drag mode"
  >
    <ToggleButton
      title="translate: drag"
      value={DRAG_MODES.TRANSLATE}
      aria-label={DRAG_MODES.TRANSLATE}
      {...extraButtonProps}
    >
      <OpenWithIcon />
    </ToggleButton>
    <ToggleButton
      title="translate vertically: ctrl + shift + ↕ drag"
      value={DRAG_MODES.TRANSLATE_VERTICAL}
      aria-label={DRAG_MODES.TRANSLATE_VERTICAL}
      {...extraButtonProps}
    >
      <HeightIcon />
    </ToggleButton>
    <ToggleButton
      title="translate horizontally: ctrl + alt + ↔ drag"
      value={DRAG_MODES.TRANSLATE_HORIZONTAL}
      aria-label={DRAG_MODES.TRANSLATE_HORIZONTAL}
      {...extraButtonProps}
    >
      <HeightIcon classes={{ root: classes.rotateButton }} />
    </ToggleButton>
    <ToggleButton
      title="rotate: shift + ↕ drag or wheel"
      value={DRAG_MODES.ROTATE}
      aria-label={DRAG_MODES.ROTATE}
      {...extraButtonProps}
    >
      <CachedIcon />
    </ToggleButton>
    <ToggleButton
      title="scale texture: ctrl + ↕ drag or wheel"
      value={DRAG_MODES.SCALE_TEXTURE}
      aria-label={DRAG_MODES.SCALE_TEXTURE}
      {...extraButtonProps}
    >
      <ZoomOutMapIcon />
    </ToggleButton>
    <ToggleButton
      title="zoom in/out: alt + ↕ drag or wheel"
      value={DRAG_MODES.SCALE_VIEW}
      aria-label={DRAG_MODES.SCALE_VIEW}
      {...extraButtonProps}
    >
      <AspectRatioIcon />
    </ToggleButton>
  </MyToggleButtonGroup>
));
