import * as React from 'react';
import { render } from 'react-dom';

import '../common/style/index.css';
import { MoveableTexture } from './components/MovableTexture';


render(
  <MoveableTexture />,
  document.getElementById('root'),
);
