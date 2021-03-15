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
import { WorkspaceStoreProvider } from './DielineViewer/models/WorkspaceModel';
import darkTheme from './DielineViewer/data/material-ui-dark-theme';
import { ROUTES } from '../common/constants';

// @ts-ignore
export const theme = createMuiTheme(darkTheme);

const App = () => (
  <ThemeProvider theme={theme}>
    <WorkspaceStoreProvider>
      <MemoryRouter initialEntries={[`/${ROUTES.TEXTURE_EDITOR}`]} initialIndex={0}>
        <Switch>
          <Route path={`/${ROUTES.TEXTURE_EDITOR}`}>
            <TextureTransformEditor />
          </Route>
          <Route path={`/${ROUTES.DIELINE_EDITOR}`}>
            <DielineViewer />
          </Route>
        </Switch>
      </MemoryRouter>
    </WorkspaceStoreProvider>
  </ThemeProvider>
);
render(
  (<App />),
  document.getElementById('app'),
);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
