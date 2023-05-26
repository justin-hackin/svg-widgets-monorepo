import React from 'react';
import { RawPoint } from 'fluent-svg-path-ts';
import { SVGWrapper } from '@/common/components/SVGWrapper';
import { closedPolygonPath } from '../../../common/shapes/generic';
import { pathDToViewBoxStr } from '../../../common/util/svg';

export function DecorationBoundarySVG(
  { normalizedDecorationBoundaryPoints }: { normalizedDecorationBoundaryPoints: RawPoint[] },
) {
  const normalizedDecorationBoundaryPathD = closedPolygonPath(normalizedDecorationBoundaryPoints)
    .getD();

  return (
    <SVGWrapper documentAreaProps={{ viewBox: pathDToViewBoxStr(normalizedDecorationBoundaryPathD) }}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPathD} />
    </SVGWrapper>
  );
}
