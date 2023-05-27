import React from 'react';
import { render } from 'react-dom';
import './widgets';
import { WidgetWorkspaceApp } from 'svg-widget-studio';

render(
  (<WidgetWorkspaceApp />),
  document.getElementById('app'),
);
