import React from 'react';
import { Tooltip, IconButton } from '@material-ui/core';
import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import { observer } from 'mobx-react';

export const HistoryButtons = observer(({ history }) => (
  <>
    <Tooltip title="Undo" arrow>
      <span>
        <IconButton
          color="inherit"
          aria-label="Undo"
          disabled={!history.canUndo}
          onClick={() => {
            history.undo();
          }}
        >
          <UndoIcon />
        </IconButton>
      </span>
    </Tooltip>
    <Tooltip title="Redo" arrow>
      <span>
        <IconButton
          color="inherit"
          aria-label="Redo"
          disabled={!history.canRedo}
          onClick={() => {
            history.redo();
          }}
        >
          <RedoIcon />
        </IconButton>
      </span>
    </Tooltip>
  </>
));
