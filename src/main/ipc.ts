const { dialog } = require('electron');
const datauri = require('datauri');
const sizeOfImage = require('image-size');
const path = require('path');
const fsPromises = require('fs').promises;

const formattedJSONStringify = (obj) => JSON.stringify(obj, null, 2);

enum MAIN_EVENTS {
  SAVE_SVG = 'save-svg',
  SAVE_GLTF = 'save-gltf',
  DIALOG_SAVE_MODEL_WITH_SVG = 'dialog-save-model-with-svg',
  SAVE_MODEL_WITH_SVG = 'save-model-with-svg',
  LOAD_SNAPSHOT = 'load-snapshot',
  OPEN_SVG = 'open-svg',
  OPEN_TEXTURE_WINDOW = 'open-texture-window',
  RESET_DRAG_MODE = 'reset-drag-mode',
  GET_TEXTURE_FILE_PATH = 'get-texture-file-path',
  SELECT_TEXTURE = 'select-texture',
}

enum ROUTED_EVENTS {
  REQUEST_SHAPE_UPDATE = 'request-shape-update',
  UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION = 'update-texture-editor-texture',
  UPDATE_TEXTURE_EDITOR_BORDER_DATA = 'update-texture-editor-border-data',
  UPDATE_DIELINE_VIEWER = 'update-dieline-viewer',
}

export enum WINDOWS {
  TEXTURE_EDITOR = 'texture-editor',
  DIELINE_EDITOR = 'dieline-editor'
}

export const ROUTED_EVENT_MAP: Record<WINDOWS, ROUTED_EVENTS[]> = {
  [WINDOWS.DIELINE_EDITOR]: [
    ROUTED_EVENTS.REQUEST_SHAPE_UPDATE,
    ROUTED_EVENTS.UPDATE_DIELINE_VIEWER,
  ],
  [WINDOWS.TEXTURE_EDITOR]: [
    ROUTED_EVENTS.UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION,
    ROUTED_EVENTS.UPDATE_TEXTURE_EDITOR_BORDER_DATA,
  ],
};

export const EVENTS = {
  ...MAIN_EVENTS, ...ROUTED_EVENTS,
};

const svgFilters = [{ name: 'SVG - Scalable Vector Graphics', extensions: ['svg'] }];
const textureFilters = [{ name: 'Vector/bitmap file', extensions: ['svg', 'jpg', 'png'] }];

const jsonFilters = [{ name: 'JSON', extensions: ['json'] }];
const glbFilters = [{ name: 'GLB 3D model', extensions: ['glb'] }];

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.SAVE_SVG, (e, fileContent, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return fsPromises.writeFile(filePath, fileContent);
  }));

  ipcMain.handle(EVENTS.SAVE_GLTF, (e, glbArrayBuffer, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: glbFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return fsPromises.writeFile(filePath, Buffer.from(glbArrayBuffer));
  }));

  const resolveStringDataFromDialog = async (dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) { return null; }
    const filePath = filePaths[0];
    const fileString = await fsPromises.readFile(filePath, 'utf8');
    return { filePath, fileString };
  };

  const writeModelAndSvg = async (svgContent, modelData, svgFilePath) => {
    const svgFileName = path.basename(svgFilePath, '.svg');
    const jsonPath = path.join(path.dirname(svgFilePath), `${svgFileName}.json`);
    await Promise.all([
      fsPromises.writeFile(svgFilePath, svgContent),
      fsPromises.writeFile(jsonPath, formattedJSONStringify(modelData))]);
    return svgFilePath;
  };

  ipcMain.handle(EVENTS.DIALOG_SAVE_MODEL_WITH_SVG,
    (e, svgContent, modelData, dialogOptions) => dialog.showSaveDialog({
      ...dialogOptions,
      filters: svgFilters,
    }).then(({ canceled, filePath }) => {
      if (canceled) {
        return null;
      }
      return writeModelAndSvg(svgContent, modelData, filePath);
    }));

  ipcMain.handle(EVENTS.SAVE_MODEL_WITH_SVG,
    (_, svgContent, modelData, filePath) => writeModelAndSvg(svgContent, modelData, filePath));

  ipcMain.handle(EVENTS.LOAD_SNAPSHOT, () => resolveStringDataFromDialog(
    { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
  ).then(({ fileString, filePath }) => ({
    fileData: JSON.parse(fileString),
    filePath,
  })));

  ipcMain.handle(EVENTS.OPEN_SVG, async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  ipcMain.handle(EVENTS.GET_TEXTURE_FILE_PATH, async (_, dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      ...dialogOptions,
      filters: textureFilters,
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle(EVENTS.SELECT_TEXTURE, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      message: 'Open texture path',
      filters: textureFilters,
    });

    const texturePath = !canceled && filePaths[0];
    if (!texturePath) { return null; }
    const extName = path.extname(texturePath);
    const sourceFileName = path.basename(texturePath, extName);

    if (extName === '.svg') {
      return fsPromises.readFile(texturePath, 'utf8')
        .then((svgString) => ({ isPath: true, svgString, sourceFileName }));
    }
    const imageData = await datauri(texturePath);
    const { width, height } = sizeOfImage(texturePath);
    return {
      isPath: false,
      pattern: {
        imageData,
        dimensions: { width, height },
        sourceFileName,
      },
    };
  });
};
