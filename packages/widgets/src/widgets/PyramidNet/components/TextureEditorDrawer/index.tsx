import React from 'react';
import { observer } from 'mobx-react';
import { Drawer } from '@mui/material';
import { styled } from '@mui/styles';
import { useWorkspaceMst } from 'svg-widget-studio';
import type { PyramidNetWidgetModel } from '../../models/PyramidNetWidgetStore';
import { TextureEditor } from './components/TextureEditor';

const DrawerStyled = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '100%',
    overflowY: 'unset',
    position: 'absolute',
  },
});

export const TextureEditorDrawer = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore = workspaceStore.selectedStore as unknown as PyramidNetWidgetModel;
  if (!pyramidNetPluginStore) { return null; }
  return (
    <DrawerStyled
      anchor="right"
      variant="persistent"
      open={pyramidNetPluginStore.textureEditorOpen}
      transitionDuration={500}
    >
      <TextureEditor />
    </DrawerStyled>
  );
});
