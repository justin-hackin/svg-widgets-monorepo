import { IconButton, Tooltip } from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import React from 'react';

import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  if (!pyramidNetStore) {
    return null;
  }

  return (
    <>
      <Tooltip title="Open texture editor" arrow>
        <IconButton
          onClick={() => { pyramidNetStore.setTextureEditorOpen(true); }}
        >
          <BrushIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};
