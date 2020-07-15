import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import CachedIcon from '@material-ui/icons/Cached';
import OpenWithIcon from '@material-ui/icons/OpenWith';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { useHotkeys } from 'react-hotkeys-hook';

import * as React from 'react';

export const DRAG_MODES = {
  ROTATE: 'rotate',
  TRANSLATE: 'translate',
  SCALE_TEXTURE: 'scale texture',
  SCALE_VIEW: 'scale view',
};

export const DragModeOptionsGroup = ({ dragMode, setDragMode }) => {
  useHotkeys('shift+r', () => { setDragMode(DRAG_MODES.ROTATE); });
  useHotkeys('shift+d', () => { setDragMode(DRAG_MODES.TRANSLATE); });
  useHotkeys('shift+s', () => { setDragMode(DRAG_MODES.SCALE_TEXTURE); });
  useHotkeys('shift+v', () => { setDragMode(DRAG_MODES.SCALE_VIEW); });

  return (
    <ToggleButtonGroup
      value={dragMode}
      style={{ height: 'fit-content', margin: '0.5em' }}
      exclusive
      onChange={(_, newDragMode) => {
        setDragMode(newDragMode);
      }}
      aria-label="drag mode"
    >
      {/* translate is too technical for end user */}
      <ToggleButton value={DRAG_MODES.TRANSLATE} aria-label={DRAG_MODES.TRANSLATE}>
        {/* Tooltips should be around whole button but this breaks the active style */}
        <Tooltip title="drag (⬆️ + d)">
          <OpenWithIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value={DRAG_MODES.ROTATE} aria-label={DRAG_MODES.ROTATE}>
        <Tooltip title="rotate (⬆️ + r)">
          <CachedIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value={DRAG_MODES.SCALE_TEXTURE} aria-label={DRAG_MODES.SCALE_TEXTURE}>
        <Tooltip title="scale texture (⬆️ + s)">
          <ZoomOutMapIcon />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value={DRAG_MODES.SCALE_VIEW} aria-label={DRAG_MODES.SCALE_VIEW}>
        <Tooltip title="scale view (⬆️ + v)">
          <AspectRatioIcon />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
