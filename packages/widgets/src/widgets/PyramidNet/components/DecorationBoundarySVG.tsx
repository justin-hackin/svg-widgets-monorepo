import React from 'react';
import { RawPoint } from 'fluent-svg-path-ts';
import { SVGWrapper } from 'svg-widget-studio';
import { closedPolygonPath } from '../../../common/shapes/generic';

export function DecorationBoundarySVG(
  { normalizedDecorationBoundaryPoints }: { normalizedDecorationBoundaryPoints: RawPoint[] },
) {
  const normalizedDecorationBoundaryPath = closedPolygonPath(normalizedDecorationBoundaryPoints);

  return (
    <SVGWrapper documentAreaProps={normalizedDecorationBoundaryPath.getBoundingBox()}>
      <path fill="#FFD900" stroke="#000" d={normalizedDecorationBoundaryPath.getD()} />
    </SVGWrapper>
  );
}
