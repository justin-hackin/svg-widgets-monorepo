import { Button, Tooltip } from '@material-ui/core';
import BrushIcon from '@material-ui/icons/Brush';
import React from 'react';

import { useWorkspaceMst } from '../../../models/WorkspaceModel';
import { HistoryButtons } from '../PyramidNetControlPanel/components/HistoryButtons';
import { useStyles } from '../../../../../common/style/style';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const { pyramidNetSpec: { history }, setTextureEditorOpen } = workspaceStore.selectedStore;
  return (
    <>
      <HistoryButtons history={history} />

      <Tooltip title="Open texture editor" arrow>
        <Button
          className={classes.dielinePanelButton}
          startIcon={<BrushIcon />}
          onClick={() => { setTextureEditorOpen(true); }}
        >
          Texture
        </Button>
      </Tooltip>
    </>
  );
};
