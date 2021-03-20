import React from 'react';
import { useGesture, useDrag } from 'react-use-gesture';
import { clamp } from 'lodash';
import { Paper } from '@material-ui/core';
import { observer } from 'mobx-react';

import { viewBoxAttrsToString } from '../../../common/util/svg';
import { TextureSvg } from './TextureSvg';
import { DRAG_MODES } from '../models/ModifierTrackingModel';
import { castCoordToRawPoint } from '../../common/util/geom';
import { useWorkspaceMst } from '../../DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../DielineViewer/models/PyramidNetMakerStore';

export const TextureArrangement = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore:IPyramidNetPluginModel = workspaceStore.selectedStore;
  const {
    texture,
    placementAreaDimensions,
    absoluteMovementToSvg, translateAbsoluteCoordsToRelative,
    decorationBoundary,
    viewScalePercentStr, viewScaleCenterPercentStr,
    minImageScale, maxImageScale,
    viewScaleDiff, setViewScaleDiff, reconcileViewScaleDiff,
    modifierTracking: { dragMode = undefined } = {},
  } = pyramidNetPluginStore.textureEditor || {};
  const {
    setTranslateDiff, setRotateDiff, setScaleDiff, setTransformOriginDiff,
    reconcileTranslateDiff, reconcileRotateDiff, reconcileScaleDiff, reconcileTransformOriginDiff,
  } = texture || {};
  // Init
  const textureTranslationUseDrag = useDrag(({ movement, down }) => {
    // early exit not possible before hooks
    const movementPt = castCoordToRawPoint(movement);
    if (
      dragMode === DRAG_MODES.TRANSLATE
      || dragMode === DRAG_MODES.TRANSLATE_HORIZONTAL
      || dragMode === DRAG_MODES.TRANSLATE_VERTICAL
    ) {
      if (down) {
        const svgMovement = absoluteMovementToSvg(movementPt);
        if (dragMode === DRAG_MODES.TRANSLATE) {
          setTranslateDiff(svgMovement);
        } else if (dragMode === DRAG_MODES.TRANSLATE_VERTICAL) {
          setTranslateDiff({ x: 0, y: svgMovement.y });
        } else if (dragMode === DRAG_MODES.TRANSLATE_HORIZONTAL) {
          setTranslateDiff({ x: svgMovement.x, y: 0 });
        }
      } else {
        reconcileTranslateDiff();
      }
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        setRotateDiff((movementPt.y / placementAreaDimensions.height) * 360);
      } else {
        reconcileRotateDiff();
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        setScaleDiff((movementPt.y / placementAreaDimensions.height) + 1);
      } else {
        reconcileScaleDiff();
      }
    }
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down }) => {
    // accommodates the scale of svg so that the texture stays under the mouse
    const relDelta = translateAbsoluteCoordsToRelative(castCoordToRawPoint(movement));
    if (down) {
      setTransformOriginDiff(castCoordToRawPoint(relDelta));
    } else {
      reconcileTransformOriginDiff();
    }
  });

  // mouse wheel scale/rotate/zoom
  const viewUseWheel = useGesture({
    onWheel: ({ movement: [, y] }) => {
      if (!placementAreaDimensions || !decorationBoundary) { return; }
      const percentHeightDelta = (y / placementAreaDimensions.height);
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        const newViewScaleMux = (percentHeightDelta + 1) * viewScaleDiff;
        setViewScaleDiff(newViewScaleMux);
        return;
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        setRotateDiff(texture.rotateDiff + percentHeightDelta * 90);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        setScaleDiff(clamp((percentHeightDelta + 1) * texture.scaleDiff, minImageScale, maxImageScale));
      }
    },
    onWheelEnd: () => {
      if (!placementAreaDimensions || !decorationBoundary) { return; }
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        reconcileViewScaleDiff();
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        reconcileRotateDiff();
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        reconcileScaleDiff();
      }
    },
  });
  if (!placementAreaDimensions || !decorationBoundary) { return null; }

  return (
    <Paper
      // @ts-ignore
      component="svg"
      square
      elevation={5}
      width="100%"
      height="100%"
      {...viewUseWheel()}
    >
      <svg
        x={viewScaleCenterPercentStr}
        y={viewScaleCenterPercentStr}
        width={viewScalePercentStr}
        height={viewScalePercentStr}
        className="root-svg"
        viewBox={viewBoxAttrsToString(decorationBoundary.viewBoxAttrs)}
      >
        <TextureSvg
          {...{
            textureTranslationUseDrag,
            transformOriginUseDrag,
          }}
        />
      </svg>
    </Paper>
  );
});
