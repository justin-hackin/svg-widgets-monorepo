import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import CachedIcon from '@material-ui/icons/Cached';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import HeightIcon from '@material-ui/icons/Height';
import clsx from 'clsx';

import React from 'react';
import { observer } from 'mobx-react';
import { DRAG_MODES } from '../models/ModifierTrackingModel';
import { useStyles } from '../../../style/style';
import { TOUR_ELEMENT_CLASSES } from '../../../util/tour';

// TODO: remove hover effects
const extraButtonProps = {
  disableFocusRipple: true,
  disableRipple: true,
  style: { cursor: 'default' },
};

export const DragModeOptionsGroup = observer(({ dragMode }) => {
  const classes = useStyles();
  return (
    <ToggleButtonGroup
      className={clsx(TOUR_ELEMENT_CLASSES.DRAG_MODE_INDICATOR, classes.dragModeOptionsGroup)}
      value={dragMode}
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
        title="translate vertically: ctrl + shift + drag"
        value={DRAG_MODES.TRANSLATE_VERTICAL}
        aria-label={DRAG_MODES.TRANSLATE_VERTICAL}
        {...extraButtonProps}
      >
        <HeightIcon />
      </ToggleButton>
      <ToggleButton
        title="translate horizontally: ctrl + alt + drag"
        value={DRAG_MODES.TRANSLATE_HORIZONTAL}
        aria-label={DRAG_MODES.TRANSLATE_HORIZONTAL}
        {...extraButtonProps}
      >
        <HeightIcon classes={{ root: classes.rotateButton }} />
      </ToggleButton>
      <ToggleButton
        title="rotate: shift + drag/wheel"
        value={DRAG_MODES.ROTATE}
        aria-label={DRAG_MODES.ROTATE}
        {...extraButtonProps}
      >
        <CachedIcon />
      </ToggleButton>
      <ToggleButton
        title="scale texture: ctrl + drag/wheel"
        value={DRAG_MODES.SCALE_TEXTURE}
        aria-label={DRAG_MODES.SCALE_TEXTURE}
        {...extraButtonProps}
      >
        <ZoomOutMapIcon />
      </ToggleButton>
      <ToggleButton
        title="zoom in/out: alt + drag/wheel"
        value={DRAG_MODES.SCALE_VIEW}
        aria-label={DRAG_MODES.SCALE_VIEW}
        {...extraButtonProps}
      >
        <AspectRatioIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
});
