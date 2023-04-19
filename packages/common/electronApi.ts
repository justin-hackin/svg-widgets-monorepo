/* eslint-disable import/no-extraneous-dependencies */
import { ipcRenderer } from 'electron';
import { join } from 'path';
import {
  dialogOpenJsonRes, ParsedFilePathData, PatternInfo, TxtFileInfo,
} from './types';
import { EVENTS } from './constants';

/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */
const SVG_EXT_NAME = 'SVG - Scalable Vector Graphics';
const SVG_EXT = 'svg';

const formattedJSONStringify = (obj) => JSON.stringify(obj, null, 2);

const saveSvgAssets = (assetSVGData: TxtFileInfo[], dirname: string) => Promise.all(assetSVGData
  .map(({ filePath, fileString }) => ipcRenderer.invoke(
    EVENTS.SAVE_TXT_FILE, join(dirname, filePath), fileString,
  )));

export const _electronApi = {
  getJsonFromDialog: async (
    message: string,
  ): Promise<dialogOpenJsonRes> => {
    const res = await ipcRenderer.invoke(
      EVENTS.DIALOG_OPEN_TXT_FILE, { message }, 'json', 'JSON',
    );
    if (!res) { return undefined; }
    const { fileString, filePath } = res;
    return { fileData: JSON.parse(fileString), filePath };
  },

  getPatternInfoFromDialog: (): Promise<PatternInfo> => ipcRenderer.invoke(EVENTS.DIALOG_ACQUIRE_PATTERN_INFO),

  saveSvgWithDialog: (
    svgString: string, message: string, defaultPath: string,
  ): Promise<string | undefined> => ipcRenderer
    .invoke(EVENTS.DIALOG_SAVE_JSON_FILE, svgString, {
      message,
      defaultPath,
    }, SVG_EXT, SVG_EXT_NAME),

  saveJsonFileWithDialog: (
    fileData: object, message: string, defaultBasename: string,
  ): Promise<ParsedFilePathData | undefined> => ipcRenderer.invoke(
    EVENTS.DIALOG_SAVE_JSON_FILE,
    formattedJSONStringify(fileData),
    { message, defaultPath: `${defaultBasename}.json` },
  ),

  saveGlbWithDialog: (shapeGLTF: ArrayBuffer, message: string, defaultPath: string) => ipcRenderer.invoke(
    EVENTS.DIALOG_SAVE_GLB, shapeGLTF, { message, defaultPath },
  ),

  saveSvgAndAssetsWithDialog: async (
    assetSVGData: TxtFileInfo[], snapshot: object, message: string,
    defaultBasename: string,
  ): Promise<string | undefined> => {
    const res = await _electronApi.saveJsonFileWithDialog(
      snapshot, message, defaultBasename,
    );
    if (!res) {
      return undefined;
    }
    const { path, dirname } = res;
    await saveSvgAssets(assetSVGData, dirname);
    return path;
  },

  saveSvgAndModel: async (
    assetSVGData: TxtFileInfo[], snapshot: object, path: string,
  ): Promise<void> => {
    const { dirname } = await ipcRenderer.invoke(EVENTS.SAVE_TXT_FILE, path, JSON.stringify(snapshot));
    await saveSvgAssets(assetSVGData, dirname);
  },

  openSvgWithDialog: (message: string): Promise<TxtFileInfo | undefined> => ipcRenderer.invoke(
    EVENTS.DIALOG_OPEN_TXT_FILE, { message }, SVG_EXT, SVG_EXT_NAME,
  ),

  addDragModeResetHandler: (handler) => {
    ipcRenderer.on(EVENTS.RESET_DRAG_MODE, handler);
  },

  removeDragModeResetHandler: (handler) => {
    ipcRenderer.removeListener(EVENTS.RESET_DRAG_MODE, handler);
  },
};

export type electronApiType = typeof _electronApi;
