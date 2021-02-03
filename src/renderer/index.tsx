import React from 'react';
import { render } from 'react-dom';

import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import { WINDOWS } from '../main/ipc';

const routes = { // A map of "route" => "component"
  default: DielineViewer,
  [WINDOWS.TEXTURE_EDITOR]: TextureTransformEditor,
  [WINDOWS.DIELINE_EDITOR]: DielineViewer,
};

const route = window.location.hash.split('#/')[1];
render(
  React.createElement(routes[route]),
  document.getElementById('app'),
);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
