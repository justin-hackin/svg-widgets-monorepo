import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { useWorkspaceMst, WorkspaceStoreProvider } from './DielineViewer/models/WorkspaceModel';
import { darkThemeOptions } from './DielineViewer/data/material-ui-dark-theme';

export const theme = createMuiTheme(darkThemeOptions);

const ProviderWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      {children}
    </WorkspaceStoreProvider>
  </ThemeProvider>
);

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { selectedAdditionalMainContent: AdditionalMainContent } = workspaceStore;
  return (
    <>
      <DielineViewer />
      <AdditionalMainContent />
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
