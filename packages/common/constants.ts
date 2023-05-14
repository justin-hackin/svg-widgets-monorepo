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

export const IS_PRODUCTION_BUILD = import.meta.env.MODE === 'production';
export const IS_DEVELOPMENT_BUILD = import.meta.env.MODE === 'development';

export const WIDGET_EXT = 'widget';
export const WIDGET_DESC = 'widget spec file';
