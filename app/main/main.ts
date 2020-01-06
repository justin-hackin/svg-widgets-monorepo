// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app, BrowserWindow,
} = require('electron');
const { format } = require('url');
// @ts-ignore
const path = require('path');
const isDev = require('electron-is-dev');
const { resolve } = require('app-root-path');
const os = require('os');

require('./ipc');

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

  // eslint-disable-next-line max-len
  const reactExtension = '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.3.0_0';
  BrowserWindow.addDevToolsExtension(
    path.join(os.homedir(), reactExtension),
  );

  mainWindow.once('ready-to-show', () => {
    // @ts-ignore
    // mainWindow.toggleDevTools();
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
