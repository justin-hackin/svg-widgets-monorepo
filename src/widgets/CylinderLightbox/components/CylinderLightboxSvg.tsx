import React from 'react';

import { CylinderLightboxWidgetModel } from '../index';

export function CylinderLightboxSvg({ widgetStore }: { widgetStore: CylinderLightboxWidgetModel }) {
  const {
    ringRadius: { value: ringRadius },
    sectionPathD,
    wallPathD,
    innerRadius,
    designBoundaryRadius,
    holderTabD,
  } = widgetStore;

  return (
    <g>
      <circle r={ringRadius} fill="none" stroke="red" />
      <circle r={innerRadius} fill="none" stroke="green" />
      <circle r={designBoundaryRadius} fill="none" stroke="blue" />
      <path d={sectionPathD} fill="white" stroke="black" fillRule="evenodd" />
      <path d={wallPathD} fill="white" stroke="black" />
      <path d={holderTabD} fill="blue" stroke="black" fillRule="evenodd" />
    </g>
  );
}
