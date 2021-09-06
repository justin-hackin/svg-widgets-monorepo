import React from 'react';
import { observer } from 'mobx-react';
// @ts-ignore
import clsx from 'clsx';
import { PathData } from '../../../../renderer/DielineViewer/util/PathData';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { useStyles } from '../../../style/style';
import { PyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { ImageFaceDecorationPatternModel } from '../../../models/ImageFaceDecorationPatternModel';

export const TexturePathNodes = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const { textureEditor } = workspaceStore.selectedStore as PyramidNetPluginModel;
  const {
    faceDecoration, selectedTextureNodeIndex, showNodes, imageCoverScale, nodeScaleMux,
  } = textureEditor;
  const classes = useStyles();

  if (
    !faceDecoration || !showNodes || faceDecoration.pattern instanceof ImageFaceDecorationPatternModel
  ) { return null; }

  const points = (new PathData(faceDecoration.pattern.pathD)).getDestinationPoints();
  return (
    <>
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
                className={`${classes.textureNodeHighlight
                } ${index === selectedTextureNodeIndex ? 'selected' : undefined
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
    </>
  );
});
