const { dialog } = require('electron');
const svgpath = require('svgpath');
const fsPromises = require('fs').promises;
const path = require('path');
const { intersectPathData, subtractPathData } = require('lib2geom-path-boolean-addon');
const { VERY_LARGE_NUMBER } = require('../renderer/DielineViewer/util/geom');
const { PathData } = require('../renderer/DielineViewer/util/PathData');

const svgFilters = [{
  name: 'SVG - Scalable Vector Graphics',
  extensions: ['svg'],
}];

const jsonFilters = [{
  name: 'JSON',
  extensions: ['json'],
}];

export const setupIpc = (ipcMain) => {
  ipcMain.handle('intersect-svg', (e, boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive) => {
    const texturePathTransformedD = svgpath.from(texturePathD).transform(textureTransformMatrixStr).toString();
    if (isPositive) {
      const punchoutPath = new PathData();
      punchoutPath
        .move([-VERY_LARGE_NUMBER, -VERY_LARGE_NUMBER])
        .line([VERY_LARGE_NUMBER, -VERY_LARGE_NUMBER])
        .line([VERY_LARGE_NUMBER, VERY_LARGE_NUMBER])
        .line([-VERY_LARGE_NUMBER, VERY_LARGE_NUMBER])
        .close();
      const punchoutPathTransformedD = svgpath.from(
        punchoutPath.getD(),
      ).transform(textureTransformMatrixStr).toString();
      const punchedPathD = subtractPathData(punchoutPathTransformedD, texturePathTransformedD);
      return intersectPathData(punchedPathD, boundaryPathD);
    }
    return intersectPathData(texturePathTransformedD, boundaryPathD);
  });


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

  ipcMain.handle('list-texture-files', () => fsPromises.readdir('static/images/textures')
    .then((filesList) => filesList.filter((fileName) => path.extname(fileName) === '.svg')));

  ipcMain.handle('load-net-spec', () => resolveStringDataFromDialog(
    { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
  ).then((jsonString) => JSON.parse(jsonString)));


  ipcMain.handle('open-svg', async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  ipcMain.handle('get-svg-string-by-path', (e, absolutePath) => fsPromises.readFile(
    absolutePath, 'utf8',
  ));
};
