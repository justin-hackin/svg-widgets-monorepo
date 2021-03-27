/* eslint-disable no-param-reassign */
import React from 'react';
import { observer } from 'mobx-react';
import { Drawer } from '@material-ui/core';
import { useWorkspaceMst } from '../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../DielineViewer/models/PyramidNetMakerStore';
import { useStyles } from '../../common/style/style';
import { TextureEditor } from '../../common/components/TextureEditor';

// TODO: make #texture-bounds based on path bounds and account for underflow, giving proportional margin

export const TextureEditorDrawer = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore:IPyramidNetPluginModel = workspaceStore.selectedStore;

  const classes = useStyles();
  return (
    <Drawer
      className={classes.textureEditorRoot}
      anchor="right"
      variant="persistent"
      open={pyramidNetPluginStore.textureEditorOpen}
      classes={{ paper: classes.textureEditorPaper }}
      transitionDuration={500}
    >
      <TextureEditor hasCloseButton />
    </Drawer>
  );
});
