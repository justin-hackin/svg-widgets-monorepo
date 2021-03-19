import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { ROUTES } from '../../../../../common/constants';
import { useWorkspaceMst } from '../../../models/WorkspaceModel';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  return (
    <Tooltip title="Open/reveal texture editor" arrow>
      <Button
        color="inherit"
        startIcon={<OpenInNewIcon />}
        onClick={() => { workspaceStore.setCurrentRoute(ROUTES.TEXTURE_EDITOR); }}
      >
        Texture
      </Button>
    </Tooltip>
  );
};
