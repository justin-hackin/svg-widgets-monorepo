import React from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { WorkspaceStoreProvider } from './DielineViewer/models/WorkspaceModel';
import darkTheme from './DielineViewer/data/material-ui-dark-theme';
import { ROUTES } from '../common/constants';

// @ts-ignore
export const theme = createMuiTheme(darkTheme);

const ProviderWrapper = ({ children }) => (
  <WorkspaceStoreProvider>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </WorkspaceStoreProvider>
);

const App = () => (
  <ProviderWrapper>
    <MemoryRouter initialEntries={[ROUTES.DIELINE_EDITOR]} initialIndex={0}>
      <Switch>
        <Route path={ROUTES.TEXTURE_EDITOR} component={TextureTransformEditor} />
        <Route path={ROUTES.DIELINE_EDITOR} component={DielineViewer} />
      </Switch>
    </MemoryRouter>
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
