import * as React from 'react';
import { render } from 'react-dom';
// eslint-disable-next-line import/no-cycle
import { SVGViewer } from './components/SVGViewer';

import '../common/style/index.css';
import './data/PyramidNetMakerStore';

render(
  <SVGViewer />,
  document.getElementById('root'),
);
