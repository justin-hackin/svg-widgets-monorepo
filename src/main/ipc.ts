const { dialog } = require('electron');
const svgpath = require('svgpath');
const path = require('path');
const fsPromises = require('fs').promises;
const { intersectPathData, subtractPathData } = require('lib2geom-path-boolean');
const { PathData } = require('../renderer/DielineViewer/util/PathData');
const { VERY_LARGE_NUMBER } = require('../renderer/common/constants');

const formattedJSONStringify = (obj) => JSON.stringify(obj, null, 2);

export const EVENT_TARGET_DELIMITER = '<=';

export enum WINDOWS {
  TEXTURE_EDITOR = 'texture-editor',
  DIELINE_EDITOR = 'dieline-editor'
}

// TODO: use enum if event names allow
enum MAIN_EVENTS {
  SAVE_SVG = 'save-svg',
  SAVE_GLTF = 'save-gltf',
  SAVE_NET_SVG_AND_SPEC = 'save-net-svg-and-spec',
  INTERSECT_SVG = 'intersect-svg',
  LOAD_NET_SPEC = 'load-net-spec',
  OPEN_SVG = 'open-svg',
  OPEN_TEXTURE_WINDOW = 'open-texture-window',
  RESET_DRAG_MODE = 'reset-drag-mode',
  GET_SVG_STRING_BY_PATH = 'get-svg-string-by-path',
  GET_SVG_FILE_PATH = 'get-svg-path',
  GET_PATH_BASENAME = 'get-path-basename',
}

enum ROUTED_EVENTS {
  REQUEST_SHAPE_UPDATE = 'request-shape-update',
  UPDATE_TEXTURE_EDITOR_SHAPE_DECORATION = 'update-texture-editor-texture',
  UPDATE_TEXTURE_EDITOR_BORDER_DATA = 'update-texture-editor-border-data',
  UPDATE_DIELINE_VIEWER = 'update-dieline-viewer',
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
const jsonFilters = [{ name: 'JSON', extensions: ['json'] }];
const gltfFilters = [{ name: 'GLTF 3D model', extensions: ['gltf'] }];

export const setupIpc = (ipcMain) => {
  ipcMain.handle(EVENTS.INTERSECT_SVG,
    (e, decorationBoundaryPathD, texturePathD, textureTransformMatrixStr, isPositive) => {
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
        return intersectPathData(punchedPathD, decorationBoundaryPathD);
      }
      return intersectPathData(texturePathTransformedD, decorationBoundaryPathD);
    });

  ipcMain.handle(EVENTS.SAVE_SVG, (e, fileContent, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return fsPromises.writeFile(filePath, fileContent);
  }));

  ipcMain.handle(EVENTS.SAVE_GLTF, (e, gltfObj, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: gltfFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) { return null; }
    return fsPromises.writeFile(filePath, formattedJSONStringify(gltfObj));
  }));

  ipcMain.handle(EVENTS.GET_PATH_BASENAME, (e, pathName) => path.basename(pathName));

  const resolveStringDataFromDialog = async (dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(dialogOptions);
    if (canceled) { return null; }
    return fsPromises.readFile(filePaths[0], 'utf8');
  };

  ipcMain.handle(EVENTS.SAVE_NET_SVG_AND_SPEC, (e, svgContent, pyramidNetSpec, dialogOptions) => dialog.showSaveDialog({
    ...dialogOptions,
    filters: svgFilters,
  }).then(({ canceled, filePath }) => {
    if (canceled) {
      return null;
    }
    return Promise.all([
      fsPromises.writeFile(filePath, svgContent),
      fsPromises.writeFile(`${filePath.slice(0, -4)}.json`, formattedJSONStringify(pyramidNetSpec))]);
  }));

  ipcMain.handle(EVENTS.LOAD_NET_SPEC, () => resolveStringDataFromDialog(
    { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
  ).then((jsonString) => JSON.parse(jsonString)));

  ipcMain.handle(EVENTS.OPEN_SVG, async (e, message) => resolveStringDataFromDialog({
    message,
    filters: svgFilters,
  }));

  ipcMain.handle(EVENTS.GET_SVG_FILE_PATH, async (_, dialogOptions) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      ...dialogOptions,
      filters: svgFilters,
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle(EVENTS.GET_SVG_STRING_BY_PATH, (e, absolutePath) => fsPromises.readFile(
    absolutePath, 'utf8',
  ));
};
