import { Route } from 'wouter';
import { WidgetSelectionDialog, WidgetWorkspace, WidgetWorkspaceProvider } from 'svg-widget-studio';
import React from 'react';
import { POLYHEDRAL_NET_MODEL_TYPE } from '@/widgets/PyramidNet/models/PyramidNetWidgetStore';
import { FileInputs } from '@/widgets/PyramidNet/components/FileInputs';
import { TextureEditorDrawer } from '@/widgets/PyramidNet/components/TextureEditorDrawer/index';

export function App() {
  return (
    <WidgetWorkspaceProvider>
      <Route path={`/widgets/${POLYHEDRAL_NET_MODEL_TYPE}`}>
        <FileInputs />
        <TextureEditorDrawer />
      </Route>
      <WidgetWorkspace />
      <WidgetSelectionDialog />
    </WidgetWorkspaceProvider>
  );
}
