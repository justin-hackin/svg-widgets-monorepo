/* eslint-disable no-param-reassign */
import React from 'react';
import { observer } from 'mobx-react';
import { Drawer } from '@material-ui/core';
import { PyramidNetPluginModel } from '../../models/PyramidNetMakerStore';
import { useStyles } from '../../../../../common/style/style';
import { useWorkspaceMst } from '../../../../WidgetWorkspace/models/WorkspaceModel';
import { TextureEditor } from './components/TextureEditor';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin

export const TextureEditorDrawer = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore:PyramidNetPluginModel = workspaceStore.selectedStore;
  if (!pyramidNetPluginStore) { return null; }
  const classes = useStyles();
  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={pyramidNetPluginStore.textureEditorOpen}
      classes={{ paper: classes.textureEditorPaper }}
      transitionDuration={500}
    >
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <TextureEditor hasCloseButton />
    </Drawer>
  );
});
