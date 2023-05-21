import { IS_PRODUCTION_BUILD } from '../constants';

export enum TRANSFORM_METHODS {
  DRAG = 'drag',
  SCROLL = 'scroll',
}

export enum TRANSFORM_OPERATIONS {
  TRANSLATE_TEXTURE = 'translateTexture',
  TRANSLATE_TEXTURE_ALONG_AXIS = 'translateTextureAlongAxis',
  ROTATE_TEXTURE = 'rotateTexture',
  SCALE_TEXTURE = 'scaleTexture',
  SCALE_VIEW = 'scaleView',
  DRAG_ORIGIN = 'dragOrigin',
}

const scrollableOperations = [
  TRANSFORM_OPERATIONS.ROTATE_TEXTURE, TRANSFORM_OPERATIONS.SCALE_TEXTURE, TRANSFORM_OPERATIONS.SCALE_VIEW];

type TransformOperationsTrackingObject = Partial<Record<TRANSFORM_OPERATIONS, number>>;
type TransformTrackingObject = Partial<Record<TRANSFORM_METHODS, TransformOperationsTrackingObject>>;

const transformTracking: TransformTrackingObject = {};

export const incrementTransformTracking = (method: TRANSFORM_METHODS, operation: TRANSFORM_OPERATIONS) => {
  if (IS_PRODUCTION_BUILD) {
    transformTracking[method] = transformTracking[method] || {};

    if (!transformTracking[method]?.[operation] === undefined) {
      transformTracking[method]![operation] = 0;
    }
    (transformTracking[method]![operation] as number) += 1;
  }
};

export const TEXTURE_TRANSFORM_EVENT = 'textureTransform';
const TRANSFORM_VARIABLES_PREFIX = 'textureTransform';

const getTransformDataLayerObject = (operation: TRANSFORM_OPERATIONS, method: TRANSFORM_METHODS, tally) => ({
  event: TEXTURE_TRANSFORM_EVENT,
  [`${TRANSFORM_VARIABLES_PREFIX}.method`]: method,
  [`${TRANSFORM_VARIABLES_PREFIX}.operation`]: operation,
  [`${TRANSFORM_VARIABLES_PREFIX}.operationIsScrollable`]: scrollableOperations.includes(operation),
  [`${TRANSFORM_VARIABLES_PREFIX}.tally`]: tally,
});

export const reportTransformsTally = () => {
  if (IS_PRODUCTION_BUILD) {
    for (const method of Object.values(TRANSFORM_METHODS)) {
      for (const operation of Object.values(TRANSFORM_OPERATIONS)) {
        if (transformTracking[method] && transformTracking[method]![operation]) {
          window.dataLayer.push(getTransformDataLayerObject(operation, method, transformTracking[method]![operation]));
          transformTracking[method]![operation] = 0;
        }
      }
    }
  }
};
