import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { observer } from 'mobx-react';

export const HistoryButtons = observer(({ history }) => (
  <>
    <Tooltip title="Undo" arrow>
      <span>
        <IconButton
          aria-label="Undo"
          disabled={!history.canUndo}
          onClick={() => { history.undo(); }}
          size="large"
        >
          <UndoIcon />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Redo" arrow>
      <span>
        <IconButton
          aria-label="Redo"
          disabled={!history.canRedo}
          onClick={() => { history.redo(); }}
          size="large"
        >
          <RedoIcon />
        </IconButton>
      </span>
    </Tooltip>
  </>
));
