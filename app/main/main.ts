// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app, BrowserWindow, ipcMain, dialog,
} = require('electron');
const { format } = require('url');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { promisify } = require('util');
const { resolve } = require('app-root-path');

const writeFileAsync = promisify(fs.writeFile);

const saveStringToDisk = (filePath, data) => writeFileAsync(filePath, data);

ipcMain.handle('save-svg', (e, fileContent, message) => dialog.showSaveDialog({
  message,
  filters: [{
    name: 'SVG - Scalable Vector Graphics',
    extensions: ['svg'],
  }],
}).then(({ canceled, filePath }) => {
  if (canceled) { return null; }
  return saveStringToDisk(filePath, fileContent);
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