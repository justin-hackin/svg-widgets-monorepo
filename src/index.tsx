import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import { ProvidersWrapper } from './common/components/ProvidersWrapper';
import { useWorkspaceMst } from './WidgetWorkspace/rootStore';
import { WidgetWorkspace } from './WidgetWorkspace';
import './widgets/index';

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
