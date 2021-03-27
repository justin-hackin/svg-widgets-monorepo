import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import { DielineViewer } from './DielineViewer';
import '../common/style/index.css';
import { useWorkspaceMst } from './DielineViewer/models/WorkspaceModel';
import { ProvidersWrapper } from '../common/components/ProvidersWrapper';

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { SelectedAdditionalMainContent } = workspaceStore;
  return (
    <>
      <DielineViewer />
      <SelectedAdditionalMainContent />
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

// fast refresh
if (module.hot) {
  module.hot.accept();
}
