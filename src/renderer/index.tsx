import React from 'react';
import { render } from 'react-dom';
import { Titlebar, Color } from 'custom-electron-titlebar';

import { TextureTransformEditor } from './TextureTransformEditor';
import { DielineViewer } from './DielineViewer';
import './common/style/index.css';
import darkTheme from './DielineViewer/data/material-ui-dark-theme';
import requireStatic from './requireStatic';
import { WINDOWS } from '../main/ipc';
import { workspaceStore } from './DielineViewer/models/WorkspaceModel';

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

// eslint-disable-next-line no-new
export const customTitlebar = new Titlebar({
  backgroundColor: Color.fromHex(darkTheme.palette.background.default),
  menu: undefined,
  // would be nice if this concern could remain in main via remote.getCurrentWindow().isClosable()
  // however, On Linux isClosable always returns true thus behaviour can only be reliably enforced with:
  closeable: route === WINDOWS.DIELINE_EDITOR,
  icon: requireStatic('images/logo.png'),
});
customTitlebar.updateTitle(workspaceStore.titleBarText);

// fast refresh
if (module.hot) {
  module.hot.accept();
}
