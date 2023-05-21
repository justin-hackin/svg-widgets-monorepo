import type { DocumentAreaProps } from '@/WidgetWorkspace/widget-types/types';
import React, { FC, SVGProps } from 'react';
import { namespacedElementFactory } from '../../util/svg';

const svgNamespaceAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  'xmlns:sodipodi': 'http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd',
  'xmlns:inkscape': 'http://www.inkscape.org/namespaces/inkscape',
  'xmlns:cc': 'http://creativecommons.org/ns#',
  'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  xmlnsXlink: 'http://www.w3.org/1999/xlink',
};

// TODO: leverage coming support for colon syntax for namespaced xml elements
// https://github.com/microsoft/TypeScript/pull/37421/commits/83c6814771cd67555bd01a9e8fc66d57276e83ca

const SodipodiNamedview = namespacedElementFactory('sodipodi:namedview');
const namedviewAttributes = {
  pagecolor: '#2d2d2d',
  'window-maximized': '1',
  'current-layer': 'dielines',
};

export type WatermarkContentComponent = FC<{ documentAreaProps: DocumentAreaProps }>;
type DocumentAreaPropertyNames = 'width' | 'height' | 'viewBox';
type SVGWrapperProps =
  Omit<SVGProps<any>, DocumentAreaPropertyNames>
  & { WatermarkContent?: WatermarkContentComponent } & { documentAreaProps: DocumentAreaProps };

export function SVGWrapper({
  children, documentAreaProps, WatermarkContent, ...rest
}: SVGWrapperProps) {
  return (
    <svg {...rest} {...documentAreaProps} {...svgNamespaceAttributes}>
      { WatermarkContent && (<WatermarkContent documentAreaProps={documentAreaProps} />)}
      <SodipodiNamedview {...namedviewAttributes} />
      {children}
    </svg>
  );
}
