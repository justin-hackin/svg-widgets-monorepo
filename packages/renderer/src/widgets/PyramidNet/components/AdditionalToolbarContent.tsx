import { Tooltip } from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import React from 'react';

import { PanelButton } from '../../../common/style/style';
import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { HistoryButtons } from './HistoryButtons';
import { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { savedModel: { history } } = pyramidNetStore;
  return (
    <>
      { history && (<HistoryButtons history={history} />)}

      <Tooltip title="Open texture editor" arrow>
        <PanelButton
          startIcon={<BrushIcon />}
          onClick={() => { pyramidNetStore.setTextureEditorOpen(true); }}
        >
          Texture
        </PanelButton>
      </Tooltip>
    </>
  );
};
