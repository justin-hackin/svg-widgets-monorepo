/* eslint-disable no-param-reassign */
import React from 'react';
import { observer } from 'mobx-react';
import { Drawer } from '@mui/material';
import { styled } from '@mui/styles';
import { PyramidNetWidgetModel } from '../../models/PyramidNetWidgetStore';
import { useWorkspaceMst } from '../../../../WidgetWorkspace/models/WorkspaceModel';
import { TextureEditor } from './components/TextureEditor';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin
const MyDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '100%',
    overflowY: 'unset',
    position: 'absolute',
  },
});

export const TextureEditorDrawer = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore = workspaceStore.selectedStore as PyramidNetWidgetModel;
  if (!pyramidNetPluginStore) { return null; }
  return (
    <MyDrawer
      anchor="right"
      variant="persistent"
      open={pyramidNetPluginStore.textureEditorOpen}
      transitionDuration={500}
    >
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <TextureEditor hasCloseButton />
    </MyDrawer>
  );
});
