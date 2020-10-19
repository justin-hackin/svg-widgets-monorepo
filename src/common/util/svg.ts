import React from 'react';
import { svgPathBbox } from 'svg-path-bbox';

const parseString = (str) => {
  const parser = new window.DOMParser();
  return parser.parseFromString(str, 'image/svg+xml');
};

export const extractCutHolesFromSvgString = (svgString:string):string => {
  const doc = parseString(svgString);
  const path = doc.querySelector('path:last-of-type');
  return path ? (path.getAttribute('d') || '') : '';
};

export const extractViewBoxFromSvg = (svgString:string) => {
  const doc = parseString(svgString);
  // TODO: error handling
  // @ts-ignore
  return doc.querySelector('svg').getAttribute('viewBox');
};

export const namespacedElementFactory = (elName) => (p: any) => {
  const { children, ...props } = p;
  return React.createElement(elName, props, children);
};

export const getDimensionsFromPathD = (d) => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(d);
  return {
    width: xmax - xmin, height: ymax - ymin,
  };
};

export const pathDToViewBoxAttrs = (d) => {
  const [xmin, ymin, xmax, ymax] = svgPathBbox(d);
  return {
    xmin, ymin, xmax, ymax, width: xmax - xmin, height: ymax - ymin,
  };
};

export const viewBoxAttrsToString = (vb) => `${vb.xmin} ${vb.ymin} ${vb.width} ${vb.height}`;

export const pathDToViewBoxStr = (d) => viewBoxAttrsToString(pathDToViewBoxAttrs(d));
