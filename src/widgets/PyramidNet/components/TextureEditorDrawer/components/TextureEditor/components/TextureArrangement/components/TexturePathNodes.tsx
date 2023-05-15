import React from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { styled } from '@mui/styles';
import { PathData } from '@/common/path/PathData';
import { useWorkspaceMst } from '@/WidgetWorkspace/rootStore';
import type { PyramidNetWidgetModel } from '../../../../../../../models/PyramidNetWidgetStore';
import { ImageFaceDecorationPatternModel } from '../../../../../../../models/ImageFaceDecorationPatternModel';
import { RawFaceDecorationModel } from '../../../../../../../models/RawFaceDecorationModel';

const classes = {
  textureNode: 'texture-node',
  selected: 'texture-node--selected',
  highlight: 'texture-node-highlight',
};

const NodesGroup = styled('g')({
  [`& .${classes.textureNode}`]: {
    fill: '#00A9F4',
    [`&.${classes.selected}`]: {
      fill: '#ff00ff',
    },
  },
});

export const TexturePathNodes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { textureEditor } = workspaceStore.selectedStore as PyramidNetWidgetModel;
  const {
    faceDecoration, selectedTextureNodeIndex, showNodes, imageCoverScale, viewerModel,
  } = textureEditor;
  const { nodeScaleMux: { value: nodeScaleMux } } = viewerModel;

  if (
    !showNodes || faceDecoration instanceof RawFaceDecorationModel
    || faceDecoration.pattern instanceof ImageFaceDecorationPatternModel
  ) { return null; }

  const points = (new PathData(faceDecoration.pattern.pathD)).getDestinationPoints();
  return (
    <NodesGroup>
      {
        points.map(({ x: cx, y: cy }, index) => {
          const longerTextureSideLength = imageCoverScale.widthIsClamp
            ? faceDecoration.dimensions.width : faceDecoration.dimensions.height;
          return (
            <g key={`${index}--${cx},${cy}`}>
              <circle
                {...{ cx, cy }}
                className={clsx(classes.textureNode, (selectedTextureNodeIndex === index) && 'selected')}
                stroke="none"
                r={(nodeScaleMux * longerTextureSideLength) / 500}
              />
              <circle
                {...{ cx, cy }}
                stroke="none"
                className={`${classes.highlight
                } ${index === selectedTextureNodeIndex ? classes.selected : undefined
                }`}
                r={(nodeScaleMux * longerTextureSideLength) / 100}
                onClick={() => {
                  textureEditor.setSelectedTextureNodeIndex(index);
                }}
              />
            </g>
          );
        })
      }
    </NodesGroup>
  );
});
