import React, { FC, SVGProps } from 'react';
import { namespacedElementFactory } from '../../util/svg';

const svgNamespaceAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
  'xmlns:cc': 'http://creativecommons.org/ns#',
  'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
};

// TODO: leverage coming support for colon syntax for namespaced xml elements
// https://github.com/microsoft/TypeScript/pull/37421/commits/83c6814771cd67555bd01a9e8fc66d57276e83ca

const SodipodiNamedview = namespacedElementFactory('sodipodi:namedview');
const namedviewAttributes = {
  pagecolor: '#2d2d2d',
  'window-maximized': '1',
  'current-layer': 'dielines',
};

export type WatermarkContentComponent = FC<{ viewBox: string }>;

export function SVGWrapper({ children, WatermarkContent, ...rest }:
SVGProps<any> & { WatermarkContent?: WatermarkContentComponent }) {
  return (
    <svg {...rest} {...svgNamespaceAttributes}>
      { WatermarkContent && (<WatermarkContent viewBox={rest.viewBox} />)}
      <SodipodiNamedview {...namedviewAttributes} />
      {children}
    </svg>
  );
}
