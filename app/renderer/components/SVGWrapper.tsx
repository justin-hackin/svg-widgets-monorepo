import React from 'react';

export const SVGWrapper = ({ children, ...rest }) => (
  <svg {...rest}>
    {...children}
  </svg>
);
