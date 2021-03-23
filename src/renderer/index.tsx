import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { Slide } from '@material-ui/core';
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
      {children}
    </WorkspaceStoreProvider>
  </ThemeProvider>
);

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { currentRoute, selectedAdditionalRoutes } = workspaceStore;
  return (
    <>
      {Object.keys(selectedAdditionalRoutes).map((route) => (
        <Slide key={route} direction="left" in={route === currentRoute}>
          {React.createElement(selectedAdditionalRoutes[route])}
        </Slide>
      ))}
      <DielineViewer />
    </>
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
