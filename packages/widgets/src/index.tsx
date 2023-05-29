import React from 'react';
import { render } from 'react-dom';
import './widgets';
import { workspaceStore } from 'svg-widget-studio';
import { connectReduxDevTools } from 'mobx-keystone';
// eslint-disable-next-line import/no-extraneous-dependencies
import remotedev from 'remotedev';
import { App } from '@/App';

render(
  (<App />),
  document.getElementById('app'),
);

if (import.meta.env.MODE === 'development') {
  // @ts-ignore
  window.workspaceStore = workspaceStore;
  // if this module is imported in web build,
  // `import "querystring"` appears in index bundle, breaks app
  // eslint-disable-next-line import/no-extraneous-dependencies

  const connection = remotedev.connectViaExtension({
    name: 'Polyhedral Net Studio',
  });

  connectReduxDevTools(remotedev, connection, workspaceStore);
}
