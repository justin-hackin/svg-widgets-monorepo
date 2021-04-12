import React from 'react';
import { useDrag, useGesture } from 'react-use-gesture';
import { clamp } from 'lodash';
import { Paper } from '@material-ui/core';
import { observer } from 'mobx-react';

import { viewBoxAttrsToString } from '../../../util/svg';
import { TextureSvg } from './TextureSvg';
import { DRAG_MODES } from '../models/ModifierTrackingModel';
import { castCoordToRawPoint } from '../../../util/geom';
import { useWorkspaceMst } from '../../../../renderer/DielineViewer/models/WorkspaceModel';
import { IPyramidNetPluginModel } from '../../../../renderer/DielineViewer/models/PyramidNetMakerStore';
import { ANALYTICS_BUFFERED_EVENTS } from '../../../util/analytics';
import { TOUR_ELEMENT_CLASSES } from '../../../util/tour';

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
    incrementTransformsBuffer,
  } = pyramidNetPluginStore.textureEditor || {};
  const {
    translateDiff, setTranslateDiff, setRotateDiff, setScaleDiff, setTransformOriginDiff,
    reconcileTranslateDiff, reconcileRotateDiff, reconcileScaleDiff, reconcileTransformOriginDiff,
  } = texture || {};
  // Init
  const textureTransformationUseDrag = useDrag(({ movement, down }) => {
    const movementPt = castCoordToRawPoint(movement);

    if (dragMode === DRAG_MODES.SCALE_VIEW) {
      if (down) {
        setViewScaleDiff((movementPt.y / placementAreaDimensions.height) + 1);
      } else {
        reconcileViewScaleDiff();
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.DRAG_SCALE_VIEW);
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
          setTranslateDiff(svgMovement);
        } else if (dragMode === DRAG_MODES.TRANSLATE_VERTICAL) {
          setTranslateDiff({ x: 0, y: svgMovement.y });
        } else if (dragMode === DRAG_MODES.TRANSLATE_HORIZONTAL) {
          setTranslateDiff({ x: svgMovement.x, y: 0 });
        }
      } else {
        // could lead to false categorization but it's unlikely that the drag diff would be exactly 0 for either axis
        // if dragMode is TRANSLATE
        const translateType = (translateDiff.x === 0 || translateDiff.y === 0)
          ? ANALYTICS_BUFFERED_EVENTS.DRAG_TRANSLATE_AXIS : ANALYTICS_BUFFERED_EVENTS.DRAG_TRANSLATE;
        incrementTransformsBuffer(translateType);
        reconcileTranslateDiff();
      }
    } else if (dragMode === DRAG_MODES.ROTATE) {
      if (down) {
        setRotateDiff((movementPt.y / placementAreaDimensions.height) * 360);
      } else {
        reconcileRotateDiff();
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.DRAG_ROTATE);
      }
    } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
      if (down) {
        setScaleDiff((movementPt.y / placementAreaDimensions.height) + 1);
      } else {
        reconcileScaleDiff();
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.DRAG_SCALE_TEXTURE);
      }
    }
  });

  // ORIGIN
  const transformOriginUseDrag = useDrag(({ movement, down, event }) => {
    event.stopPropagation();
    // accommodates the scale of svg so that the texture stays under the mouse
    const relDelta = translateAbsoluteCoordsToRelative(castCoordToRawPoint(movement));
    if (down) {
      setTransformOriginDiff(castCoordToRawPoint(relDelta));
    } else {
      reconcileTransformOriginDiff();
      incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.DRAG_ORIGIN);
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
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.SCROLL_SCALE_VIEW);
      }
      if (!texture) { return; }
      if (dragMode === DRAG_MODES.ROTATE) {
        reconcileRotateDiff();
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.SCROLL_ROTATE);
      } else if (dragMode === DRAG_MODES.SCALE_TEXTURE) {
        reconcileScaleDiff();
        incrementTransformsBuffer(ANALYTICS_BUFFERED_EVENTS.SCROLL_SCALE_TEXTURE);
      }
    },
  });
  if (!placementAreaDimensions || !decorationBoundary) { return null; }

  return (
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
        viewBox={viewBoxAttrsToString(decorationBoundary.viewBoxAttrs)}
      >
        <TextureSvg {...{ transformOriginUseDrag }} />
      </svg>
    </Paper>
  );
});
