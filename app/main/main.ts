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
  // eslint-disable-next-line max-len
  const reactExtension = '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.3.0_0';
  BrowserWindow.addDevToolsExtension(
    path.join(os.homedir(), reactExtension),
  );

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
    // @ts-ignore
    // mainWindow.toggleDevTools();
    mainWindow.show();
  });

  const getUrl = (fileName, isDevUrl) => (isDevUrl ? `http://localhost:1124/${fileName}` : format({
    pathname: resolve(`app/renderer/.parcel/production/${fileName}`),
    protocol: 'file:',
    slashes: true,
  }));

  mainWindow.setMenu(null);
  mainWindow.loadURL(getUrl('die-line-viewer/indx.html', isDev));


  const textureWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: resolve('app/main/preload.js'),
    },
  });

  textureWindow.once('ready-to-show', () => {
    // @ts-ignore
    // mainWindow.toggleDevTools();
    textureWindow.show();
  });

  textureWindow.setMenu(null);
  textureWindow.loadURL(getUrl('texture-transform-editor/texture.html', isDev));
});

app.on('window-all-closed', app.quit);
