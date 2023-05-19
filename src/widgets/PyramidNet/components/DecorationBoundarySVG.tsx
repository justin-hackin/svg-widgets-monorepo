import React from 'react';
import { RawPoint } from '@/common/util/geom';
import { SVGWrapper } from '@/common/components/SVGWrapper';
import { closedPolygonPath } from '../../../common/path/shapes/generic';
import { pathDToViewBoxStr } from '../../../common/util/svg';

export function DecorationBoundarySVG(
  { normalizedDecorationBoundaryPoints }: { normalizedDecorationBoundaryPoints: RawPoint[] },
) {
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints)
    .getD();

  return (
    <SVGWrapper viewBox={pathDToViewBoxStr(normalizedDecorationBoundaryPathD)}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </SVGWrapper>
  );
}
