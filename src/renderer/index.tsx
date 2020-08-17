import React from 'react';
// @ts-ignore
import { render } from 'react-dom';
import { Router } from 'react-router-static';
import { MoveableTexture } from './texture-transform-editor/components/MovableTexture';
import { SVGViewer } from './die-line-viewer/components/SVGViewer';
import { hot } from 'react-hot-loader/root';
import './common/style/index.css';

const routes = { // A map of "route" => "component"
  default: SVGViewer,
  'texture-transform-editor': MoveableTexture,
  'die-line-viewer': SVGViewer,
};

const HotRouter = hot(Router);

render(
  <HotRouter routes={routes} />,
  document.getElementById('app'),
);
