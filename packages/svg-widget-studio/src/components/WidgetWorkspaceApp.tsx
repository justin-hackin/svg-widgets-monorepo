import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWorkspaceMst } from '../rootStore';
import { WidgetWorkspace } from './WidgetWorkspace';
import { WidgetWorkspaceProvider } from './WidgetWorkspaceProvider';
import { WidgetSelectionDialog } from './WidgetSelectionDialog';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { AdditionalMainContent } = workspaceStore?.selectedStore || {};

  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (location === '/') {
      setLocation('/widgets/new');
    }
  }, []);

  return (
    <>
      <WidgetWorkspace />
      {AdditionalMainContent && (<AdditionalMainContent />)}
      <WidgetSelectionDialog />
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
