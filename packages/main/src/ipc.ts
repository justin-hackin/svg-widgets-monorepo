import { endsWith } from 'lodash';
import { dialog } from 'electron';
import datauri from 'datauri';
import sizeOfImage from 'image-size';
import { basename, dirname, extname } from 'path';
import fs from 'fs';
import { EVENTS } from '../../common/constants';
import { ParsedFilePathData, PatternInfo, TxtFileInfo } from '../../common/types';

const fsPromises = fs.promises;

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

const textureFilters = [{ name: 'Vector/bitmap file', extensions: ['svg', 'jpg', 'png'] }];

const glbFilters = [{ name: 'GLB 3D model', extensions: ['glb'] }];

// CONVENTION: use undefined as response from aborted file operation
// this way, destructuring the await of the event will not throw as it would with attempting null destructuring
// TODO: type safety between invoke and handle parameters

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.DIALOG_SAVE_JSON_FILE,
    async (
      e, fileStr, dialogOptions,
    ): Promise<ParsedFilePathData | undefined> => {
      const { canceled, filePath } = await dialog.showSaveDialog({
        ...dialogOptions,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (canceled) { return undefined; }
      const resolvedFilePath = castToFilePathWithExtension(filePath, 'json');
      await fsPromises.writeFile(resolvedFilePath, fileStr);
      const ext = extname(resolvedFilePath);
      return {
        path: resolvedFilePath,
        extname: ext,
        basename: basename(resolvedFilePath, ext),
        dirname: dirname(resolvedFilePath),
      };
    });

  ipcMain.handle(EVENTS.SAVE_TXT_FILE, (
    e, filePath, fileString,
  ) => fsPromises.writeFile(filePath, fileString).then(() => ({ dirname: dirname(filePath) })));

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

  ipcMain.handle(EVENTS.DIALOG_OPEN_TXT_FILE, async (
    e, dialogOptions, extension, extensionName,
  ): Promise<TxtFileInfo | undefined> => {
    const res = await resolveStringDataFromDialog({
      ...dialogOptions,
      filters: [{ name: extensionName || extension, extensions: [extension] }],
    });

    if (!res) { return undefined; }
    const { fileString, filePath } = res;
    return { fileString, filePath };
  });

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
