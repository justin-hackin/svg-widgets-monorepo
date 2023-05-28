import { observer } from 'mobx-react';
import React from 'react';
import { useWorkspaceMst } from '../rootStore';
import { WidgetWorkspace } from './WidgetWorkspace';
import { WidgetWorkspaceProvider } from './WidgetWorkspaceProvider';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { AdditionalMainContent } = workspaceStore?.selectedStore || {};
  return (
    <>
      <WidgetWorkspace />
      {AdditionalMainContent && (<AdditionalMainContent />)}
    </>
  );
});

export function WidgetWorkspaceApp() {
  return (
    <WidgetWorkspaceProvider>
      <AllRoutes />
    </WidgetWorkspaceProvider>
  );
}
