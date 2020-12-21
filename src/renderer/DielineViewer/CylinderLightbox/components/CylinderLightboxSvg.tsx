import React from 'react';

import { ICylinderLightBoxModel } from '../models';

export const CylinderLightboxSvg = ({ widgetStore }: { widgetStore: ICylinderLightBoxModel}) => {
  const {
    shapeDefinition: {
      sectionPathD, wallPathD, ringRadius, innerRadius, designBoundaryRadius, holderTab,
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
