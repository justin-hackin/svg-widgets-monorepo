import React from 'react';
import { observer } from 'mobx-react';
// @ts-ignore
import { PathData } from '../../DielineViewer/util/PathData';
import { useMst } from '../models';
import { useStyles } from '../style';

export const TexturePathNodes = observer(() => {
  const {
    texture, selectedTextureNodeIndex, setSelectedTextureNodeIndex, showNodes, imageCoverScale, nodeScaleMux,
  } = useMst();
  const classes = useStyles();

  if (!texture || !texture.hasPathPattern || !showNodes) { return null; }
  const points = (new PathData(texture.pattern.pathD)).getDestinationPoints();
  return (
    <>
      {
        points.map(({ x: cx, y: cy }, index) => {
          const longerTextureSideLength = imageCoverScale.widthIsClamp
            ? texture.dimensions.width : texture.dimensions.height;
          return (
            <g key={`${index}--${cx},${cy}`}>
              <circle
                {...{ cx, cy }}
                className={`${classes.textureNode} ${selectedTextureNodeIndex === index ? 'selected' : ''}`}
                stroke="none"
                r={(nodeScaleMux * longerTextureSideLength) / 500}
              />
              <circle
                {...{ cx, cy }}
                stroke="none"
                className={`${classes.textureNodeHighlight
                } ${index === selectedTextureNodeIndex ? 'selected' : undefined
                }`}
                r={(nodeScaleMux * longerTextureSideLength) / 100}
                onClick={() => {
                  setSelectedTextureNodeIndex(index);
                }}
              />
            </g>
          );
        })
      }
    </>
  );
});
