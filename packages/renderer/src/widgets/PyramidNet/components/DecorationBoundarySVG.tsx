import React from 'react';
import { closedPolygonPath } from '../../../common/path/shapes/generic';
import { pathDToViewBoxStr } from '../../../common/util/svg';
import { PyramidNetWidgetModel } from '../models/PyramidNetMakerStore';

export const DecorationBoundarySVG = ({ store }: { store: PyramidNetWidgetModel }) => {
  const {
    savedModel: { normalizedDecorationBoundaryPoints },
  } = store;
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints)
    .getD();

  return (
    <svg viewBox={pathDToViewBoxStr(normalizedDecorationBoundaryPathD)}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </svg>
  );
};