const { dialog } = require('electron');
const svgpath = require('svgpath');
const fsPromises = require('fs').promises;
const path = require('path');
const { intersectPathData, subtractPathData } = require('lib2geom-path-boolean-addon');
const { VERY_LARGE_NUMBER } = require('../renderer/DielineViewer/util/geom');
const { PathData } = require('../renderer/DielineViewer/util/PathData');

export const EVENT_TARGET_DELIMITER = '<=';
export const EVENTS = {
  SAVE_SVG: 'save-svg',
  SAVE_NET_SVG_AND_SPEC: 'save-net-svg-and-spec',
  INTERSECT_SVG: 'intersect-svg',
  LIST_TEXTURE_FILES: 'list-texture-files',
  LOAD_NET_SPEC: 'load-net-spec',
  OPEN_SVG: 'open-svg',
  RESET_DRAG_MODE: 'reset-drag-mode',
  GET_SVG_STRING_BY_PATH: 'get-svg-string-by-path',
  SHAPE_UPDATE: `tex${EVENT_TARGET_DELIMITER}shape-update`,
  SET_DIELINE_CUT_HOLES: `die${EVENT_TARGET_DELIMITER}set-dieline-cut-holes`,
  REQUEST_SHAPE_UPDATE: `die${EVENT_TARGET_DELIMITER}request-shape-update`,
};

const svgFilters = [{
  name: 'SVG - Scalable Vector Graphics',
  extensions: ['svg'],
}];

const jsonFilters = [{
  name: 'JSON',
  extensions: ['json'],
}];

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.INTERSECT_SVG, (e, boundaryPathD, texturePathD, textureTransformMatrixStr, isPositive) => {
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


  ipcMain.handle(EVENTS.SAVE_SVG, (e, fileContent, options) => dialog.showSaveDialog({
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

  ipcMain.handle(EVENTS.SAVE_NET_SVG_AND_SPEC, (e, svgContent, jsonContent, message) => dialog.showSaveDialog({
    message,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return Promise.all([
      fsPromises.writeFile(filePath, svgContent),
      fsPromises.writeFile(`${filePath.slice(0, -4)}.json`, jsonContent)]);
  }));

  // @ts-ignore
  ipcMain.handle(EVENTS.LIST_TEXTURE_FILES, () => fsPromises.readdir(path.resolve(__static, 'images/textures'))
    .then((filesList) => filesList.filter((fileName) => path.extname(fileName) === '.svg')));

  ipcMain.handle(EVENTS.LOAD_NET_SPEC, () => resolveStringDataFromDialog(
    { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
  ).then((jsonString) => JSON.parse(jsonString)));


  ipcMain.handle(EVENTS.OPEN_SVG, async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  ipcMain.handle(EVENTS.GET_SVG_STRING_BY_PATH, (e, absolutePath) => fsPromises.readFile(
    absolutePath, 'utf8',
  ));
};
