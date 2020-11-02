import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import CachedIcon from '@material-ui/icons/Cached';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import React from 'react';
import { observer } from 'mobx-react';
import { useMst } from '../models';
import { DRAG_MODES } from '../models/ModifierTrackingModel';

// TODO: remove hover effects
const extraButtonProps = {
  disableFocusRipple: true,
  disableRipple: true,
  style: { cursor: 'default' },
};

export const DragModeOptionsGroup = observer(() => {
  const {
    // @ts-ignore
    modifierTracking: { dragMode } = {},
  } = useMst();
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
