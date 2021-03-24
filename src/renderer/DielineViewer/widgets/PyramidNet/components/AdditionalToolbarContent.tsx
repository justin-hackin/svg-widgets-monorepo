import { Button, Tooltip } from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { HistoryButtons } from '../PyramidNetControlPanel/components/HistoryButtons';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  const { pyramidNetSpec: { history }, setTextureEditorOpen } = workspaceStore.selectedStore;
  return (
    <>
      <HistoryButtons history={history} />

      <Tooltip title="Open texture editor" arrow>
        <Button
          color="inherit"
          startIcon={<OpenInNewIcon />}
          onClick={() => { setTextureEditorOpen(true); }}
        >
          Texture
        </Button>
      </Tooltip>
    </>
  );
};
