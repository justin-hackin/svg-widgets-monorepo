// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app, BrowserWindow, ipcMain, dialog,
} = require('electron');
const { format } = require('url');
const isDev = require('electron-is-dev');
const fsPromises = require('fs').promises;
const { resolve } = require('app-root-path');


const svgFilters = [{
  name: 'SVG - Scalable Vector Graphics',
  extensions: ['svg'],
}];

const jsonFilters = [{
  name: 'JSON',
  extensions: ['json'],
}];

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

ipcMain.handle('load-net-spec', () => resolveStringDataFromDialog(
  { filters: jsonFilters, message: 'Load JSON pyramid net spec data' },
).then((jsonString) => JSON.parse(jsonString)));


ipcMain.handle('open-svg', async (e, message) => resolveStringDataFromDialog({
  message,
  filters: svgFilters,
}));

app.on('ready', async () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: resolve('app/main/preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const devPath = 'http://localhost:1124';
  const prodPath = format({
    pathname: resolve('app/renderer/.parcel/production/index.html'),
    protocol: 'file:',
    slashes: true,
  });
  const url = isDev ? devPath : prodPath;

  mainWindow.setMenu(null);
  mainWindow.loadURL(url);
});

app.on('window-all-closed', app.quit);
