export enum EVENTS {
  DIALOG_SAVE_TXT_FILE = 'dialog-save-txt-file',
  SAVE_TXT_FILE = 'save-txt-file',
  DIALOG_OPEN_TXT_FILE = 'dialog-open-txt-file',
  OPEN_TXT_FILE = 'open-txt-file',
  DIALOG_SAVE_GLB = 'dialog-save-glb',
  DIALOG_ACQUIRE_PATTERN_INFO = 'dialog-acquire-pattern-info',
  RESET_DRAG_MODE = 'reset-drag-mode',
}

export const DEFAULT_SLIDER_STEP = 0.01;
export const VERY_LARGE_NUMBER = 1000000000000000;

export const TEXTURE_ARRANGEMENT_FILE_EXTENSION = 'pnst';

export const IS_ELECTRON_BUILD = import.meta.env.VITE_BUILD_ENV === 'electron';
export const IS_WEB_BUILD = import.meta.env.VITE_BUILD_ENV === 'web';
export const IS_PRODUCTION_BUILD = import.meta.env.MODE === 'production';
export const IS_DEVELOPMENT_BUILD = import.meta.env.MODE === 'development';

if (!IS_WEB_BUILD && !IS_ELECTRON_BUILD) {
  throw new Error(`unexpected BUILD_ENV, should be "electron" or "web" but saw: "${import.meta.env.VITE_BUILD_ENV}"`);
}
