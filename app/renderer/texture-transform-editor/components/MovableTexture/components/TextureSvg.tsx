import * as React from 'react';

const HOLES_COLOR = '#101010';
const MATERIAL_COLOR = '#ffaa00';
export const TextureSvg = ({
   showCenterMarker,
   faceFittingScale,
   transformOriginMarkerPos,
   boundaryPathD,
   texturePathD,
   textureTransformMatrixStr,
   textureScaleValue,
   textureRef,
   textureTranslationUseDrag,
   transformOriginUseDrag,
   isPositive,
 }) => {
  const scaleAdjust = (textureScaleValue * faceFittingScale);
  const CENTER_MARKER_RADIUS = 30 / scaleAdjust;
  const CENTER_MARKER_STROKE = 2 / scaleAdjust;
  const OPACITY = 0.3;
  const CROSSHAIR_START_RATIO = 0.2;
  const DOT_RADIUS_TO_WHOLE = 0.05;
  return (
    <svg overflow="visible">
      <path fill={isPositive ? HOLES_COLOR : MATERIAL_COLOR} d={boundaryPathD}/>
      <g transform={textureTransformMatrixStr}>
        <path
          pointerEvents="bounding-box"
          ref={textureRef}
          {...(showCenterMarker && textureTranslationUseDrag())}
          fill={isPositive ? MATERIAL_COLOR : HOLES_COLOR}
          d={texturePathD}
        />
        {showCenterMarker && (
          <g
            {...transformOriginUseDrag()}
            transform={`translate(${transformOriginMarkerPos[0]}, ${transformOriginMarkerPos[1]})`}
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
            {[[0, 1], [1, 0], [0, -1], [-1, 0]].map((coords) => {
              const lineProps = ([[x1, y1], [x2, y2]]) => ({
                x1, y1, x2, y2,
              });
              const end = coords.map((coord) => coord * CENTER_MARKER_RADIUS);
              const start = coords.map((coord) => coord * CENTER_MARKER_RADIUS * CROSSHAIR_START_RATIO);
              return (
                <line
                  {...lineProps([start, end])}
                  stroke="#000"
                  opacity={OPACITY}
                  strokeWidth={CENTER_MARKER_STROKE}
                />
              );
            })}
            <circle
              r={(DOT_RADIUS_TO_WHOLE * CENTER_MARKER_RADIUS)}
              fill="black"
              cx={0}
              cy={0}
              opacity={OPACITY}
            />
          </g>
        )}
      </g>
    </svg>
  );
};
