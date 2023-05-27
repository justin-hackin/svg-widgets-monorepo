import React from 'react';
import { RawPoint } from 'fluent-svg-path-ts';
import { pathDToViewBoxStr, SVGWrapper } from 'svg-widget-studio';
import { closedPolygonPath } from '../../../common/shapes/generic';

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
