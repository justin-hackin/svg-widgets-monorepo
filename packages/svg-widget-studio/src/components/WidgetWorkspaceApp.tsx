import { observer } from 'mobx-react';
import React from 'react';
import { WidgetWorkspace } from './WidgetWorkspace';
import { WidgetWorkspaceProvider } from './WidgetWorkspaceProvider';
import { WidgetSelectionDialog } from './WidgetSelectionDialog';

const AllRoutes = observer(() => (
  <>
    <WidgetWorkspace />
    <WidgetSelectionDialog />
  </>
));

export function WidgetWorkspaceApp() {
  return (
    <WidgetWorkspaceProvider>
      <AllRoutes />
    </WidgetWorkspaceProvider>
  );
}
