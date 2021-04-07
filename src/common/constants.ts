export enum EVENTS {
  DIALOG_SAVE_SVG = 'dialog-save-svg',
  DIALOG_SAVE_JSON = 'dialog-save-json',
  DIALOG_SAVE_GLB = 'dialog-save-glb',
  DIALOG_SAVE_MODEL_WITH_SVG = 'dialog-save-model-with-svg',
  SAVE_MODEL_WITH_SVG = 'save-model-with-svg',
  DIALOG_OPEN_JSON = 'dialog-open-json',
  DIALOG_OPEN_SVG = 'dialog-open-svg',
  DIALOG_ACQUIRE_PATTERN_INFO = 'dialog-acquire-pattern-info',
  RESET_DRAG_MODE = 'reset-drag-mode',
}

export const DEFAULT_SLIDER_STEP = 0.01;
export const VERY_LARGE_NUMBER = 1000000000000000;

export const INVALID_BUILD_ENV_ERROR = 'unexpected BUILD_ENV, should be "electron" or "web"';

export enum ANALYTICS_BUFFERED_EVENTS {
  DRAG_TRANSLATE = 'drag-translate',
  DRAG_TRANSLATE_AXIS = 'drag-translate-axis',
  DRAG_ROTATE = 'drag-rotate',
  DRAG_SCALE_TEXTURE = 'drag-scale-texture',
  DRAG_SCALE_VIEW = 'drag-scale-view',
  DRAG_ORIGIN = 'drag-origin',
  SCROLL_ROTATE = 'scroll-rotate',
  SCROLL_SCALE_TEXTURE = 'scroll-scale-texture',
  SCROLL_SCALE_VIEW = 'scroll-scale-view',
}

export enum TOUR_ELEMENT_CLASSES {
  SHAPE_SELECT = 'shape-select--tour',
  ROTATE_3D = 'rotate-3d--tour',
  UPLOAD_IMAGE = 'upload-image--tour',
  HISTORY_BUTTONS = 'history-buttons--tour',
  DOWNLOAD_3D = 'download-3d--tour',
  IS_BORDERED = 'is-bordered--tour',
  DRAG_MODE_INDICATOR = 'drag-mode-indicator--tour',
  OPEN_TEXTURE_ARRANGEMENT = 'open-texture-arrangement--tour',
  SAVE_TEXTURE_ARRANGEMENT = 'save-texture-arrangement--tour',
  SNAP_MENU = 'snap-menu--tour',
  NODE_INPUTS = 'node-inputs--tour',
  FILL_IS_POSITIVE = 'fill-is-positive--tour',
  USE_ALPHA_TEXTURE = 'use-alpha-texture--tour',
  ROTATE_INPUT = 'rotate-input--tour',
}
