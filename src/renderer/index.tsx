import React from 'react';
import {
  MemoryRouter,
  Switch,
  Route,
} from 'react-router-dom';
import { render } from 'react-dom';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { ROUTES } from '../main/ipc';
import { WorkspaceStoreProvider } from './DielineViewer/models/WorkspaceModel';
import darkTheme from './DielineViewer/data/material-ui-dark-theme';

// @ts-ignore
export const theme = createMuiTheme(darkTheme);
const ProviderWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      {children}
    </WorkspaceStoreProvider>
  </ThemeProvider>
);
const App = () => (
  <MemoryRouter>
    <ProviderWrapper>
      <Switch>
        <Route path={ROUTES.TEXTURE_EDITOR} component={() => (<TextureTransformEditor />)} />
        <Route path={ROUTES.DIELINE_EDITOR} component={() => (<DielineViewer />)} />
      </Switch>
    </ProviderWrapper>
  </MemoryRouter>
);
render(
  (<App />),
  document.getElementById('app'),
);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
