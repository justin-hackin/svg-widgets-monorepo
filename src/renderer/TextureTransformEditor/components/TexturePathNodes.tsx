import React, { useState } from 'react';
// @ts-ignore
import { PathData } from '../../DielineViewer/util/PathData';
import { useMst } from '../models';

export const TexturePathNodes = () => {
  const {
    texture, selectedTextureNodeIndex, setSelectedTextureNodeIndex, showNodes, imageCoverScale,
  } = useMst();

  const [hoveredItemIndex, setHoveredItemIndex] = useState<number>(undefined);

  if (!texture.pathD || !showNodes) { return null; }
  const points = PathData.fromDValue(texture.pathD).getDestinationPoints();
  return (
    <>
      {
        points.map(([cx, cy], index) => (
          <g key={`${index}--${cx},${cy}`}>
            <circle
              {...{ cx, cy }}
              fill={selectedTextureNodeIndex === index ? '#ff00ff' : '#00A9F4'}
              stroke="none"
              r={(imageCoverScale.widthIsClamp ? texture.dimensions.width : texture.dimensions.height) / 500}

            />
            <circle
              {...{ cx, cy }}
              fill={index === hoveredItemIndex && index !== selectedTextureNodeIndex
                ? 'rgba(255, 0, 255, 0.3)'
                : 'rgba(255, 0, 255, 0.00001)'}
              stroke="none"
              r={(imageCoverScale.widthIsClamp ? texture.dimensions.width : texture.dimensions.height) / 100}
              onMouseEnter={() => {
                setHoveredItemIndex(index);
              }}
              onMouseLeave={() => {
                setHoveredItemIndex(undefined);
              }}
              onClick={() => {
                setSelectedTextureNodeIndex(index);
              }}
            />
          </g>
        ))
}
    </>
  );
};
