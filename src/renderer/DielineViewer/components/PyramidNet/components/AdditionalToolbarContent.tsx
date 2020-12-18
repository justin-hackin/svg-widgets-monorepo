import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { EVENTS } from '../../../../../main/ipc';

export const AdditionalToolbarContent = () => {
  const handleOpenTextureEditor = () => {
    globalThis.ipcRenderer.send(EVENTS.OPEN_TEXTURE_WINDOW);
  };

  return (
    <Tooltip title="Open/reveal texture editor" arrow>
      <Button
        color="inherit"
        startIcon={<OpenInNewIcon />}
        onClick={handleOpenTextureEditor}
      >
        Texture
      </Button>
    </Tooltip>
  );
};
