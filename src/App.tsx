import React, { createContext } from 'react';
// eslint-disable-next-line import/no-cycle
import { SVGViewer } from '~components/SVGViewer';
import './style/App.css';

// @ts-ignore
export const NetConfigContext = createContext();


const App = () => (
  <SVGViewer />
);

export default App;
