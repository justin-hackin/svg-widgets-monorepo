import { Button, Tooltip } from '@material-ui/core';
import BrushIcon from '@material-ui/icons/Brush';
import React from 'react';

import { useWorkspaceMst } from '../../../WidgetWorkspace/models/WorkspaceModel';
import { HistoryButtons } from './HistoryButtons';
import { useStyles } from '../../../common/style/style';
import { PyramidNetWidgetModel } from '../models/PyramidNetMakerStore';

export const AdditionalToolbarContent = () => {
  const workspaceStore = useWorkspaceMst();
  const classes = useStyles();
  const pyramidNetStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const { savedModel: { history } } = pyramidNetStore;
  return (
    <>
      { history && (<HistoryButtons history={history} />)}

      <Tooltip title="Open texture editor" arrow>
        <Button
          className={classes.dielinePanelButton}
          startIcon={<BrushIcon />}
          onClick={() => { pyramidNetStore.setTextureEditorOpen(true); }}
        >
          Texture
        </Button>
      </Tooltip>
    </>
  );
};
