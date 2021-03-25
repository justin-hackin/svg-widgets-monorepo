import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import CachedIcon from '@material-ui/icons/Cached';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import HeightIcon from '@material-ui/icons/Height';

import React from 'react';
import { observer } from 'mobx-react';
import { DRAG_MODES } from '../models/ModifierTrackingModel';
import { useStyles } from '../../DielineViewer/style';

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
      value={dragMode}
      style={{ height: 'fit-content', margin: '0.5em' }}
      exclusive
      aria-label="drag mode"
    >
      <ToggleButton
        title="drag"
        value={DRAG_MODES.TRANSLATE}
        aria-label={DRAG_MODES.TRANSLATE}
        {...extraButtonProps}
      >
        <OpenWithIcon />
      </ToggleButton>
      <ToggleButton
        title="drag"
        value={DRAG_MODES.TRANSLATE_VERTICAL}
        aria-label={DRAG_MODES.TRANSLATE_VERTICAL}
        {...extraButtonProps}
      >
        <HeightIcon />
      </ToggleButton>
      <ToggleButton
        title="drag"
        value={DRAG_MODES.TRANSLATE_HORIZONTAL}
        aria-label={DRAG_MODES.TRANSLATE_HORIZONTAL}
        {...extraButtonProps}
      >
        <HeightIcon classes={{ root: classes.rotateButton }} />
      </ToggleButton>
      <ToggleButton
        title="shift + drag/wheel"
        value={DRAG_MODES.ROTATE}
        aria-label={DRAG_MODES.ROTATE}
        {...extraButtonProps}
      >
        <CachedIcon />
      </ToggleButton>
      <ToggleButton
        title="ctrl + drag/wheel"
        value={DRAG_MODES.SCALE_TEXTURE}
        aria-label={DRAG_MODES.SCALE_TEXTURE}
        {...extraButtonProps}
      >
        <ZoomOutMapIcon />
      </ToggleButton>
      <ToggleButton
        title="alt + drag/wheel"
        value={DRAG_MODES.SCALE_VIEW}
        aria-label={DRAG_MODES.SCALE_VIEW}
        {...extraButtonProps}
      >
        <AspectRatioIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
});
