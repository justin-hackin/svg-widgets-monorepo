import React from 'react';
import { PyramidNet } from './PyramidNet';

export const SVGWrapper = ({ store, ...rest }) => (
  <svg {...rest}>
    <PyramidNet store={store} />
  </svg>
);
