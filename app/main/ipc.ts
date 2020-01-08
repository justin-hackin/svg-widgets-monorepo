const { dialog } = require('electron');
const fsPromises = require('fs').promises;
// @ts-ignore
const path = require('path');

const svgFilters = [{
  name: 'SVG - Scalable Vector Graphics',
  extensions: ['svg'],
}];

const jsonFilters = [{
  name: 'JSON',
  extensions: ['json'],
}];

export const setupIpc = (ipcMain) => {
  ipcMain.handle('save-svg', (e, fileContent, options) => dialog.showSaveDialog({
    ...options,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return fsPromises.writeFile(filePath, fileContent);
  }));

  const resolveStringDataFromDialog = async (dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) { return null; }
    return fsPromises.readFile(filePaths[0], 'utf8');
  };

  ipcMain.handle('save-net-with-data', (e, svgContent, jsonContent, message) => dialog.showSaveDialog({
    message,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return Promise.all([
      fsPromises.writeFile(filePath, svgContent),
      fsPromises.writeFile(`${filePath.slice(0, -4)}.json`, jsonContent)]);
  }));

  ipcMain.handle('list-texture-files', () => fsPromises.readdir('app/static/images/textures')
    .then((filesList) => filesList.filter((fileName) => path.extname(fileName) === '.svg')));

  ipcMain.handle('load-net-spec', () => resolveStringDataFromDialog(
    { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
  ).then((jsonString) => JSON.parse(jsonString)));


  ipcMain.handle('open-svg', async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  ipcMain.handle('get-svg-string-by-path', (e, pathRelativeStatic) => fsPromises.readFile(
    `app/static/${pathRelativeStatic}`, 'utf8',
  ));
};
