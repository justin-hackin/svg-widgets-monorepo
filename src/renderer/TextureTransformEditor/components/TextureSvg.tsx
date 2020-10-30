import React from 'react';
import { observer } from 'mobx-react';

import { PointTuple } from '../../common/util/geom';
import { TexturePathNodes } from './TexturePathNodes';
import { useMst } from '../models';

const normalizedBoxCoords:PointTuple[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const HOLES_COLOR = '#222';
const MATERIAL_COLOR = '#ffaa00';

export const TextureSvg = observer(({
  viewBox = undefined,
  showCenterMarker = undefined,
  textureTranslationUseDrag = () => {},
  transformOriginUseDrag = () => {},
}) => {
  const {
    decorationBoundary: { pathD: decorationBoundaryPathD = '' } = {},
    texture,
    faceBoundary,
    faceFittingScale,
    placementAreaDimensions,
  } = useMst();
  // TODO: consider if passing props from parent is more apt than useMst
  if (!decorationBoundaryPathD) { return null; }
  const {
    // @ts-ignore
    pathD: texturePathD, scale: textureScale, transformOriginDragged, isPositive, transformMatrixDraggedStr,
  } = texture || {};
  if (!faceBoundary || !decorationBoundaryPathD) { return null; }
  const scaleAdjust = (textureScale * faceFittingScale.scale);
  const FACE_OUTLINE_STROKE = (faceFittingScale.widthIsClamp
    ? placementAreaDimensions.width
    : placementAreaDimensions.height) / 300;
  const CENTER_MARKER_RADIUS = 30 / scaleAdjust;
  const CENTER_MARKER_STROKE = 2 / scaleAdjust;
  const OPACITY = 0.3;
  const CROSSHAIR_START_RATIO = 0.2;
  const DOT_RADIUS_TO_WHOLE = 0.05;

  const TEXTURE_CLIP_ID = 'texture-clip';
  return (
    <svg overflow="visible" viewBox={viewBox}>
      <defs>
        <marker
          style={{ overflow: 'visible' }}
          id="Arrow1Lend"
          refX="0"
          refY="0"
          orient="auto"
        >
          <path
            transform="translate(-4, 0) scale(-0.3, 0.3)"
            style={{
              fill: '#000000',
              fillOpacity: 1,
              fillRule: 'evenodd',
              stroke: '#000000',
              strokeWidth: '1pt',
              strokeOpacity: 1,
            }}
            d="M 0,0 5,-5 -12.5,0 5,5 Z"
            id="path838"
          />
        </marker>
      </defs>

      <clipPath id={TEXTURE_CLIP_ID}>
        <path d={decorationBoundaryPathD} />
      </clipPath>

      {faceBoundary
      && (
      <path
        stroke={HOLES_COLOR}
        strokeWidth={FACE_OUTLINE_STROKE}
        fill={MATERIAL_COLOR}
        d={faceBoundary.pathD}
      />
      )}

      <path fill={isPositive ? HOLES_COLOR : MATERIAL_COLOR} d={decorationBoundaryPathD} />

      {texturePathD && (
      <g clipPath={showCenterMarker ? undefined : `url(#${TEXTURE_CLIP_ID})`}>
        <g transform={transformMatrixDraggedStr}>
          <path
            pointerEvents="bounding-box"
            {...textureTranslationUseDrag()}
            fill={isPositive ? MATERIAL_COLOR : HOLES_COLOR}
            d={texturePathD}
          />

          <TexturePathNodes />

          {showCenterMarker && (
          <g
            {...transformOriginUseDrag()}
            transform={`translate(${transformOriginDragged[0]}, ${transformOriginDragged[1]})`}
          >
            <circle
              r={CENTER_MARKER_RADIUS}
              fill="red"
              fillOpacity={OPACITY}
              stroke="red"
              strokeOpacity={1 - OPACITY}
              strokeWidth={CENTER_MARKER_STROKE}
              cx={0}
              cy={0}
            />
            {normalizedBoxCoords.map((coords, index) => {
              const end = coords.map((coord) => coord * CENTER_MARKER_RADIUS);
              const start = coords.map((coord) => coord * CENTER_MARKER_RADIUS * CROSSHAIR_START_RATIO);
              const lineProps = (([x1, y1]: PointTuple, [x2, y2]: PointTuple) => ({
                x1, y1, x2, y2,
              }))(start, end);
              return (
                <line
                  {...lineProps}
                  key={index}
                  stroke="#000"
                  opacity={OPACITY + 0.4}
                  markerEnd={index === 2 ? 'url(#Arrow1Lend)' : ''}
                  strokeWidth={CENTER_MARKER_STROKE}
                />
              );
            })}
            <circle
              r={DOT_RADIUS_TO_WHOLE * CENTER_MARKER_RADIUS}
              fill="black"
              cx={0}
              cy={0}
              opacity={OPACITY + 0.4}
            />
          </g>
          )}
        </g>
      </g>
      )}
      {showCenterMarker && (
        <path
          fill="none"
          strokeWidth={FACE_OUTLINE_STROKE}
          stroke="#ff0000"
          strokeOpacity={0.4}
          d={decorationBoundaryPathD}
        />
      )}
    </svg>
  );
});
