import React from 'react';
import {
  HashRouter,
  Switch,
  Route,
} from 'react-router-dom';
import { render } from 'react-dom';

import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { ROUTES } from '../main/ipc';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path={`/${ROUTES.TEXTURE_EDITOR}`}>
        <TextureTransformEditor />
      </Route>
      <Route path={`/${ROUTES.DIELINE_EDITOR}`}>
        <DielineViewer />
      </Route>
    </Switch>
  </HashRouter>
);

render(
  (<App />),
  document.getElementById('app'),
);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
