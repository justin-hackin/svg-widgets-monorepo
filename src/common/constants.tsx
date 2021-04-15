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

export const TEXTURE_ARRANGEMENT_FILE_EXTENSION = 'pnst';

export const INVALID_BUILD_ENV_ERROR = 'unexpected BUILD_ENV, should be "electron" or "web"';
export const IS_ELECTRON_BUILD = process.env.BUILD_ENV === 'electron';
export const IS_WEB_BUILD = process.env.BUILD_ENV === 'web';
export const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT_BUILD = process.env.NODE_ENV === 'development';
