/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';
import { dialogOpenJsonRes, dialogOpenSvgRes, PatternInfo } from './types';
import { EVENTS } from './constants';

/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
export const _electronApi = {
  getJsonFromDialog: (
    message: string, extension: string, extensionName: string,
  ): Promise<dialogOpenJsonRes> => ipcRenderer.invoke(EVENTS.DIALOG_OPEN_JSON, { message }, extension, extensionName),

  getPatternInfoFromDialog: (): Promise<PatternInfo> => ipcRenderer.invoke(EVENTS.DIALOG_ACQUIRE_PATTERN_INFO),

  saveSvgFromDialog: (svgString: string, message: string, defaultPath: string): Promise<void> => ipcRenderer
    .invoke(EVENTS.DIALOG_SAVE_SVG, svgString, {
      message,
      defaultPath,
    }),

  saveJsonFromDialog: (
    fileData: object, message: string, defaultPath: string, fileExtension: string, extensionName: string,
  ): Promise<void> => ipcRenderer.invoke(EVENTS.DIALOG_SAVE_JSON, fileData, {
    message,
    defaultPath,
  }, fileExtension, extensionName),

  saveGlbWithDialog: (shapeGLTF: ArrayBuffer, message: string, defaultPath: string) => ipcRenderer.invoke(
    EVENTS.DIALOG_SAVE_GLB, shapeGLTF, { message, defaultPath },
  ),

  saveSvgAndModelWithDialog: (
    svgString: string, snapshot: object, message: string,
    defaultPath: string, modelExtension: string, modelExtensionName: string,
  ): Promise<string | undefined> => ipcRenderer.invoke(
    EVENTS.DIALOG_SAVE_MODEL_WITH_SVG,
    svgString,
    snapshot,
    { message, defaultPath },
    modelExtension, modelExtensionName,
  ),

  saveSvgAndModel: (
    svgString: string, snapshot: object, path: string, message: string,
    modelExtension: string, modelExtensionName: string,
  ): Promise<string | undefined> => ipcRenderer.invoke(
    EVENTS.SAVE_MODEL_WITH_SVG, svgString, snapshot, path, { message }, modelExtension, modelExtensionName,
  ),

  openSvgWithDialog: (message: string): Promise<dialogOpenSvgRes | undefined> => ipcRenderer.invoke(
    EVENTS.DIALOG_OPEN_SVG, message,
  ),

  addDragModeResetHandler: (handler) => {
    ipcRenderer.on(EVENTS.RESET_DRAG_MODE, handler);
  },

  removeDragModeResetHandler: (handler) => {
    ipcRenderer.removeListener(EVENTS.RESET_DRAG_MODE, handler);
  },
};

export type electronApiType = typeof _electronApi;
