// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

export const saveStringToDisk = (filePath, data) => writeFileAsync(filePath, data);

// eslint-disable-next-line import/no-extraneous-dependencies
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--start-dev');

// Let electron reloads by itself when webpack watches changes in ./app/
if (serve) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  require('electron-reload')(__dirname);
}

ipcMain.on('save-string', (e, filePath, string) => {
  saveStringToDisk(filePath, string);
});

// To avoid being garbage collected
let mainWindow;

app.on('ready', () => {
  // eslint-disable-next-line no-shadow
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: `${__dirname}/preload.js`,
    },
  });

  const startUrl = serve ? 'http://localhost:1234' : url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    // @ts-ignore
    createWindow();// eslint-disable-line no-undef
  }
});
