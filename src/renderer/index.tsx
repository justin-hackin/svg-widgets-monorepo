import React from 'react';
import { render } from 'react-dom';
import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';

const routes = { // A map of "route" => "component"
  default: DielineViewer,
  'texture-transform-editor': TextureTransformEditor,
  'die-line-viewer': DielineViewer,
};

const route = window.location.hash.split('#/')[1];
render(
  React.createElement(routes[route]),
  document.getElementById('app'),
);

//fast refresh
if (module.hot) {
  module.hot.accept();
}
