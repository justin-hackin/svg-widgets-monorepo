import { endsWith } from 'lodash';
import { dialog } from 'electron';
import datauri from 'datauri';
import sizeOfImage from 'image-size';
import {
  basename, dirname, extname, join,
} from 'path';
import fs from 'fs';
import { EVENTS } from '../../common/constants';
import { PatternInfo } from '../../common/types';

const fsPromises = fs.promises;

const formattedJSONStringify = (obj) => JSON.stringify(obj, null, 2);

/*
  must coerce a file name without extension to a json file
  even though single extension filter is on dialog, it will not add the extension
  as a user, I expect coercion for a file name without extension in the location bar
  this is a better user experience because
  as a user, I can't be sure if I add expected extension to the path I will not get
  a double-extension if file dialog adds the filtered extension
 */
const castToFilePathWithExtension = (filePath, extension) => (endsWith(filePath, `.${extension}`)
  ? filePath : `${filePath}.${extension}`);

const svgFilters = [{ name: 'SVG - Scalable Vector Graphics', extensions: ['svg'] }];
const textureFilters = [{ name: 'Vector/bitmap file', extensions: ['svg', 'jpg', 'png'] }];

const glbFilters = [{ name: 'GLB 3D model', extensions: ['glb'] }];

// CONVENTION: use undefined as response from aborted file operation
// this way, destructuring the await of the event will not throw as it would with attempting null destructuring
// TODO: type safety between invoke and handle parameters

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.DIALOG_SAVE_SVG, (e, fileContent, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return undefined; }
    return fsPromises.writeFile(filePath, fileContent);
  }));

  ipcMain.handle(EVENTS.DIALOG_SAVE_JSON,
    (e, jsonData, dialogOptions, extension, extensionName) => dialog.showSaveDialog({
      ...dialogOptions,
      filters: [{ name: extensionName || extension, extensions: [extension] }],
    }).then(({ canceled, filePath }) => {
      if (canceled) { return undefined; }
      const resolvedFilePath = castToFilePathWithExtension(filePath, extension);
      return fsPromises.writeFile(resolvedFilePath, JSON.stringify(jsonData));
    }));

  ipcMain.handle(EVENTS.DIALOG_SAVE_GLB, (e, glbArrayBuffer, dialogOptions) => dialog.showSaveDialog({
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
    const fileName = basename(filePath).split('.')[0];
    const svgFilePath = join(dirname(filePath), `${fileName}.svg`);

    await Promise.all([
      fsPromises.writeFile(svgFilePath, svgContent),
      fsPromises.writeFile(filePath, formattedJSONStringify(modelData))]);
    return filePath;
  };

  ipcMain.handle(EVENTS.DIALOG_SAVE_MODEL_WITH_SVG,
    (e,
      svgContent, modelData, dialogOptions, extension, extensionName) => dialog.showSaveDialog({
      ...dialogOptions,
      filters: [{ name: extensionName || extension, extensions: [extension] }],
    }).then(({ canceled, filePath }) => {
      if (canceled) {
        return undefined;
      }
      return writeModelAndSvg(svgContent, modelData, castToFilePathWithExtension(filePath, extension));
    }));

  ipcMain.handle(EVENTS.SAVE_MODEL_WITH_SVG,
    (_, svgContent, modelData, filePath) => writeModelAndSvg(svgContent, modelData, filePath));

  ipcMain.handle(EVENTS.DIALOG_OPEN_JSON, (e,
    dialogOptions, extension, extensionName) => resolveStringDataFromDialog(
    { ...dialogOptions, filters: [{ name: extensionName || extension, extensions: [extension] }] },
  ).then((res) => {
    if (!res) { return undefined; }
    const { fileString, filePath } = res;
    return {
      fileData: JSON.parse(fileString),
      filePath,
    };
  }));

  ipcMain.handle(EVENTS.DIALOG_OPEN_SVG, async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  // TODO: make widget-agnostic
  ipcMain.handle(EVENTS.DIALOG_ACQUIRE_PATTERN_INFO, async (): Promise<PatternInfo | undefined> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      message: 'Open texture path',
      filters: textureFilters,
    });

    const texturePath = !canceled && filePaths[0];
    if (!texturePath) { return undefined; }
    const extName = extname(texturePath);
    const sourceFileName = basename(texturePath, extName);

    if (extName === '.svg') {
      return fsPromises.readFile(texturePath, 'utf8')
        .then((svgString) => ({ isPath: true, svgString, sourceFileName }));
    }
    const imageData = await datauri(texturePath);
    const { width, height }: { width: number, height: number } = sizeOfImage(texturePath);
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
