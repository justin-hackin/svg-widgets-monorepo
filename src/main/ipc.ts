const { endsWith } = require('lodash');
const { dialog } = require('electron');
const datauri = require('datauri');
const sizeOfImage = require('image-size');
const path = require('path');
const fsPromises = require('fs').promises;

const { EVENTS } = require('../common/constants');

const formattedJSONStringify = (obj) => JSON.stringify(obj, null, 2);

const svgFilters = [{ name: 'SVG - Scalable Vector Graphics', extensions: ['svg'] }];
const textureFilters = [{ name: 'Vector/bitmap file', extensions: ['svg', 'jpg', 'png'] }];

const jsonFilters = [{ name: 'JSON', extensions: ['json'] }];
const glbFilters = [{ name: 'GLB 3D model', extensions: ['glb'] }];

// CONVENTION: use undefined as response from aborted file operation
// this way, destructuring the await of the event will not throw as it would with attempting null destructuring

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.SAVE_SVG, (e, fileContent, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return undefined; }
    return fsPromises.writeFile(filePath, fileContent);
  }));

  ipcMain.handle(EVENTS.SAVE_JSON, (e, jsonData, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: jsonFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return undefined; }
    const resolvedFilePath = endsWith(filePath, '.json') ? filePath : `${filePath}.json`;
    return fsPromises.writeFile(resolvedFilePath, JSON.stringify(jsonData));
  }));

  ipcMain.handle(EVENTS.SAVE_GLB, (e, glbArrayBuffer, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: glbFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return undefined; }
    return fsPromises.writeFile(filePath, Buffer.from(glbArrayBuffer));
  }));

  const resolveStringDataFromDialog = async (dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) { return undefined; }
    const filePath = filePaths[0];
    const fileString = await fsPromises.readFile(filePath, 'utf8');
    return { filePath, fileString };
  };

  const writeModelAndSvg = async (svgContent, modelData, filePath) => {
    const fileName = path.basename(filePath, '.json');
    const svgFilePath = path.join(path.dirname(filePath), `${fileName}.svg`);
    /*
      must coerce a file name without extension to a json file
      even though json filter is on dialog, it will not add the extension
      as a user, I expect coercion for a file name without extension in the location bar
      this is a better user experience because
      as a user, I can't be sure if I add .json to the path I will not get
      a double-extension if file dialog adds the filtered extension
     */
    const jsonFilePath = path.join(path.dirname(filePath), `${fileName}.json`);

    await Promise.all([
      fsPromises.writeFile(svgFilePath, svgContent),
      fsPromises.writeFile(jsonFilePath, formattedJSONStringify(modelData))]);
    return jsonFilePath;
  };

  ipcMain.handle(EVENTS.DIALOG_SAVE_MODEL_WITH_SVG,
    (e, svgContent, modelData, dialogOptions) => dialog.showSaveDialog({
      ...dialogOptions,
      filters: jsonFilters,
    }).then(({ canceled, filePath }) => {
      if (canceled) {
        return undefined;
      }
      return writeModelAndSvg(svgContent, modelData, filePath);
    }));

  ipcMain.handle(EVENTS.SAVE_MODEL_WITH_SVG,
    (_, svgContent, modelData, filePath) => writeModelAndSvg(svgContent, modelData, filePath));

  ipcMain.handle(EVENTS.DIALOG_LOAD_JSON, (e, dialogOptions) => resolveStringDataFromDialog(
    { ...dialogOptions, filters: jsonFilters },
  ).then((res) => {
    if (!res) { return undefined; }
    const { fileString, filePath } = res;
    return {
      fileData: JSON.parse(fileString),
      filePath,
    };
  }));

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
