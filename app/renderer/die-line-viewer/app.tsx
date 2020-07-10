import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-cycle
import { SVGViewer } from './components/SVGViewer';

import '../common/style/index.css';
import './data/PyramidNetMakerStore';

ReactDOM.render(
  <SVGViewer />,
  document.getElementById('root'),
);
