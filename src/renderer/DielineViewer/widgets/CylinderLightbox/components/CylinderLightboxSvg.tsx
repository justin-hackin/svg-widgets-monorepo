import React from 'react';

import { CylinderLightBoxModel } from '../models';

export const CylinderLightboxSvg = ({ widgetStore }: { widgetStore: CylinderLightBoxModel }) => {
  const {
    shapeDefinition: {
      ringRadius: { value: ringRadius },
      sectionPathD,
      wallPathD,
      innerRadius,
      designBoundaryRadius,
      holderTab,
    },
  } = widgetStore;

  return (
    <g>
      <circle r={ringRadius} fill="none" stroke="red" />
      <circle r={innerRadius} fill="none" stroke="green" />
      <circle r={designBoundaryRadius} fill="none" stroke="blue" />
      <path d={sectionPathD} fill="white" stroke="black" fillRule="evenodd" />
      <path d={wallPathD} fill="white" stroke="black" />
      <path d={holderTab.getD()} fill="blue" stroke="black" fillRule="evenodd" />
    </g>
  );
};
