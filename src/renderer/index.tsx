import React from 'react';
import { render } from 'react-dom';
import { observer } from 'mobx-react';
import ReactPageScroller from 'react-page-scroller';

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
      {children}
    </WorkspaceStoreProvider>
  </ThemeProvider>
);

const baseRoutes = { [ROUTES.DIELINE_EDITOR]: DielineViewer };

const AllRoutes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  if (!workspaceStore) { return null; }
  const { currentRoute, selectedAdditionalRoutes, setCurrentRoute } = workspaceStore;
  const allRoutes = { ...baseRoutes, ...selectedAdditionalRoutes };
  return (
    <>
      <ReactPageScroller
        customPageNumber={currentRoute}
        pageOnChange={setCurrentRoute}
        renderAllPagesOnFirstRender
        blockScrollUp
        blockScrollDown
      >
        {Object.keys(allRoutes).sort().map((route) => React.createElement(allRoutes[route], { key: route }))}
      </ReactPageScroller>
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
