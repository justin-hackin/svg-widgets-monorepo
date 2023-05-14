import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import { WidgetWorkspace } from './WidgetWorkspace';
import { ProvidersWrapper } from './common/components/ProvidersWrapper';
import { useWorkspaceMst } from './WidgetWorkspace/rootStore';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { AdditionalMainContent } = workspaceStore?.selectedStore || {};
  return (
    <>
      <WidgetWorkspace />
      { AdditionalMainContent && (<AdditionalMainContent />)}
    </>
  );
});

function App() {
  return (
    <ProvidersWrapper>
      <AllRoutes />
    </ProvidersWrapper>
  );
}

render(
  (<App />),
  document.getElementById('app'),
);
