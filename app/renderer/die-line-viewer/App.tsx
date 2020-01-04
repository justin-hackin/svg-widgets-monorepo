import React, { createContext } from 'react';
// eslint-disable-next-line import/no-cycle
// import { SVGViewer } from './components/SVGViewer';
import { MoveableTexture } from '../texture-transform-editor/components/MovableTexture';

import './style/App.css';
import './data/PyramidNetMakerStore';

// @ts-ignore
export const NetConfigContext = createContext();


const App = () => (
  <MoveableTexture />
);

export default App;
