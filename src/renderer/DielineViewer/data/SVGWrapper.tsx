import React from 'react';
import { namespacedElementFactory } from '../../../common/util/svg';

const svgNamespaceAttributes = {
  'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
  xmlns: 'http://www.w3.org/2000/svg',
};

const SodipodiNamedview = namespacedElementFactory('sodipodi:namedview');
const namedviewAttributes = {
  pagecolor: '#2d2d2d',
};

export const SVGWrapper = ({ children, ...rest }) => (
  <svg {...rest} {...svgNamespaceAttributes}>
    <SodipodiNamedview {...namedviewAttributes} />
    {...children}
  </svg>
);
