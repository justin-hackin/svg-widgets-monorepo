import React from 'react';
import { namespacedElementFactory } from '../../common/util/svg';
import { LicenseGroup } from './LicenseGroup';
import { DocumentMetadata } from '../DocumentMetadata';

const svgNamespaceAttributes = {
  'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
  'xmlns:cc': 'http://creativecommons.org/ns#',
  'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  xmlns: 'http://www.w3.org/2000/svg',
};

// TODO: leverage coming support for colon syntax for namespaced xml elements
// https://github.com/microsoft/TypeScript/pull/37421/commits/83c6814771cd67555bd01a9e8fc66d57276e83ca

const SodipodiNamedview = namespacedElementFactory('sodipodi:namedview');
const namedviewAttributes = {
  pagecolor: '#2d2d2d',
  'window-maximized': '1',
  'current-layer': 'dielines',
};

export const SVGWrapper = ({ children, ...rest }) => (
  <svg {...rest} {...svgNamespaceAttributes}>
    <DocumentMetadata />
    <LicenseGroup viewBox={rest.viewBox} />
    <SodipodiNamedview {...namedviewAttributes} />
    {children}
  </svg>
);
