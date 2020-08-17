import React from 'react';
// @ts-ignore
import { render } from 'react-dom';
import { Router } from 'react-router-static';
import { hot } from 'react-hot-loader/root';
import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import './globalThis';

const routes = { // A map of "route" => "component"
  default: DielineViewer,
  'texture-transform-editor': TextureTransformEditor,
  'die-line-viewer': DielineViewer,
};

const HotRouter = hot(Router);

render(
  <HotRouter routes={routes} />,
  document.getElementById('app'),
);
