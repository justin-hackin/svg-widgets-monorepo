import React from 'react';
import { useDrag, useGesture } from 'react-use-gesture';
import { clamp } from 'lodash';
import { Paper } from '@material-ui/core';
import { observer } from 'mobx-react';

import { boundingBoxAttrsToViewBoxStr } from '../../../util/svg';
import { TextureSvg } from './TextureSvg';
import { DRAG_MODES } from '../models/ModifierTrackingModel';
import { castCoordToRawPoint } from '../../../util/geom';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import {
  incrementTransformTracking,
  TRANSFORM_METHODS,
  TRANSFORM_OPERATIONS,
} from '../../../util/analytics';
import { TOUR_ELEMENT_CLASSES } from '../../../util/tour';
import { DragModeOptionsGroup } from './DragModeOptionGroup';
import { PyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';

export const TextureArrangement = observer(() => {
  const workspaceStore = useWorkspaceMst();
  const pyramidNetPluginStore:PyramidNetPluginModel = workspaceStore.selectedStore;
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
    transformDiff, reconcileTranslateDiff, reconcileRotateDiff, reconcileScaleDiff, reconcileTransformOriginDiff,
  } = texture || {};
  // Init
  const textureTransformationUseDrag = useDrag(({ movement, down }) => {
    const movementPt = castCoordToRawPoint(movement);

    if (dragMode === DRAG_MODES.SCALE_VIEW) {
      if (down) {
        setViewScaleDiff((movementPt.y / placementAreaDimensions.height) + 1);
      } else {
        reconcileViewScaleDiff();
        incrementTransformTracking(TRANSFORM_METHODS.DRAG, TRANSFORM_OPERATIONS.SCALE_VIEW);
      }
    }

    if (!texture) { return; }
    if (
      dragMode === DRAG_MODES.TRANSLATE
      || dragMode === DRAG_MODES.TRANSLATE_HORIZONTAL
      || dragMode === DRAG_MODES.TRANSLATE_VERTICAL
    ) {
      if (down) {
        const svgMovement = absoluteMovementToSvg(movementPt);
        if (dragMode === DRAG_MODES.TRANSLATE) {
          transformDiff.setTranslate(svgMovement);
        } else if (dragMode === DRAG_MODES.TRANSLATE_VERTICAL) {
          transformDiff.setTranslate({ x: 0, y: svgMovement.y });
        } else if (dragMode === DRAG_MODES.TRANSLATE_HORIZONTAL) {
          transformDiff.setTranslate({ x: svgMovement.x, y: 0 });
        }
      } else {
        // could lead to false categorization but it's unlikely that the drag diff would be exactly 0 for either axis
        // if dragMode is TRANSLATE
        const translateType = (transformDiff.translate.x === 0 || transformDiff.translate.y === 0)
          ? TRANSFORM_OPERATIONS.TRANSLATE_TEXTURE_ALONG_AXIS : TRANSFORM_OPERATIONS.TRANSLATE_TEXTURE;
        incrementTransformTracking(TRANSFORM_METHODS.DRAG, translateType);
        reconcileTranslateDiff();
      }
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        transformDiff.setRotate((movementPt.y / placementAreaDimensions.height) * 360);
      } else {
        reconcileRotateDiff();
        incrementTransformTracking(TRANSFORM_METHODS.DRAG, TRANSFORM_OPERATIONS.ROTATE_TEXTURE);
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        transformDiff.setScale((movementPt.y / placementAreaDimensions.height) + 1);
      } else {
        reconcileScaleDiff();
        incrementTransformTracking(TRANSFORM_METHODS.DRAG, TRANSFORM_OPERATIONS.SCALE_TEXTURE);
      }
    }
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down, event }) => {
    event.stopPropagation();
    // accommodates the scale of svg so that the texture stays under the mouse
    const relDelta = translateAbsoluteCoordsToRelative(castCoordToRawPoint(movement));
    if (down) {
      transformDiff.setTransformOrigin(castCoordToRawPoint(relDelta));
    } else {
      reconcileTransformOriginDiff();
      incrementTransformTracking(TRANSFORM_METHODS.DRAG, TRANSFORM_OPERATIONS.DRAG_ORIGIN);
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
        transformDiff.setRotate(transformDiff.rotate + percentHeightDelta * 90);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        transformDiff.setScale(clamp((percentHeightDelta + 1) * transformDiff.scale, minImageScale, maxImageScale));
      }
    },
    onWheelEnd: () => {
      if (!placementAreaDimensions || !decorationBoundary) { return; }
      if (dragMode === DRAG_MODES.SCALE_VIEW) {
        reconcileViewScaleDiff();
        incrementTransformTracking(TRANSFORM_METHODS.SCROLL, TRANSFORM_OPERATIONS.SCALE_VIEW);
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        reconcileRotateDiff();
        incrementTransformTracking(TRANSFORM_METHODS.SCROLL, TRANSFORM_OPERATIONS.ROTATE_TEXTURE);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        reconcileScaleDiff();
        incrementTransformTracking(TRANSFORM_METHODS.SCROLL, TRANSFORM_OPERATIONS.SCALE_TEXTURE);
      }
    },
  });
  if (!placementAreaDimensions || !decorationBoundary) { return null; }

  return (
    <>
      <DragModeOptionsGroup dragMode={dragMode} />
      <Paper
        className={TOUR_ELEMENT_CLASSES.TEXTURE_ARRANGEMENT_AREA}
      // @ts-ignore
        component="svg"
        square
        elevation={10}
        width="100%"
        height="100%"
        style={{ overflow: 'hidden' }}
        {...viewUseWheel()}
        {...textureTransformationUseDrag()}
      >
        <svg
          x={viewScaleCenterPercentStr}
          y={viewScaleCenterPercentStr}
          width={viewScalePercentStr}
          height={viewScalePercentStr}
          className="root-svg"
          viewBox={boundingBoxAttrsToViewBoxStr(decorationBoundary.boundingBoxAttrs)}
        >
          <TextureSvg {...{ transformOriginUseDrag }} />
        </svg>
      </Paper>
    </>
  );
});
