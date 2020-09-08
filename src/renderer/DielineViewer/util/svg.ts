import React from 'react';

const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString:string):string => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? path.getAttribute('d') : null;
};

export const extractViewBoxFromSvg = (svgString:string):string => {
  const doc = parseString(svgString);
  return doc.querySelector('svg').getAttribute('viewBox');
};

export const namespacedElementFactory = (elName) => (p: any) => {
  const { children, ...props } = p;
  return React.createElement(elName, props, children);
};
