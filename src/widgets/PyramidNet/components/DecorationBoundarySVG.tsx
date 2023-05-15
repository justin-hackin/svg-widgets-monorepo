import React from 'react';
import { closedPolygonPath } from '@/common/path/shapes/generic';
import { pathDToViewBoxStr } from '@/common/util/svg';
import type { PyramidNetWidgetModel } from '../models/PyramidNetWidgetStore';

export function DecorationBoundarySVG({ store }: { store: PyramidNetWidgetModel }) {
  const {
    normalizedDecorationBoundaryPoints,
  } = store;
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints)
    .getD();

  return (
    <svg viewBox={pathDToViewBoxStr(normalizedDecorationBoundaryPathD)}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </svg>
  );
}
