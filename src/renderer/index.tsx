import React from 'react';
import { KeepAlive, Provider as KeepAliveProvider } from 'react-keep-alive';
import { render } from 'react-dom';
import { observer } from 'mobx-react';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { useWorkspaceMst, WorkspaceStoreProvider } from './DielineViewer/models/WorkspaceModel';
import darkTheme from './DielineViewer/data/material-ui-dark-theme';
import { ROUTES } from '../common/constants';

// @ts-ignore
export const theme = createMuiTheme(darkTheme);

const ProviderWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      <KeepAliveProvider>
        {children}
      </KeepAliveProvider>
    </WorkspaceStoreProvider>
  </ThemeProvider>
);

const baseRoutes = { [ROUTES.DIELINE_EDITOR]: DielineViewer };
const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { currentRoute, selectedAdditionalRoutes } = workspaceStore;
  const allRoutes = { ...baseRoutes, ...selectedAdditionalRoutes };
  const RouteComponent = allRoutes[currentRoute];
  return (
    <div style={{ height: '100%' }}>
      <KeepAlive name={currentRoute}>
        <RouteComponent />
      </KeepAlive>
    </div>
  );
});

const App = () => (
  <ProviderWrapper>
    <AllRoutes />
  </ProviderWrapper>
);

render(
  (<App />),
  document.getElementById('app'),
);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
