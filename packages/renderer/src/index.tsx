import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import { WidgetWorkspace } from './WidgetWorkspace';
import { useWorkspaceMst } from './WidgetWorkspace/models/WorkspaceModel';
import { ProvidersWrapper } from './common/components/ProvidersWrapper';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { SelectedAdditionalMainContent } = workspaceStore;
  return (
    <>
      <WidgetWorkspace />
      { SelectedAdditionalMainContent && (<SelectedAdditionalMainContent />)}
    </>
  );
});

const App = () => (
  <ProvidersWrapper>
    <AllRoutes />
  </ProvidersWrapper>
);

render(
  (<App />),
  document.getElementById('app'),
);
