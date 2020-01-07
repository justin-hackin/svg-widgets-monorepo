// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app, BrowserWindow, nativeImage,
} = require('electron');
const { format } = require('url');
// @ts-ignore
const path = require('path');
const isDev = require('electron-is-dev');
const { resolve } = require('app-root-path');
const os = require('os');

// TODO: doesn't seem to work
const icon = nativeImage.createFromPath(`${__dirname}/build-resources/icons/png/256x256.png`);
// where public folder on the root dir

require('./ipc');

app.on('ready', async () => {
  // eslint-disable-next-line max-len
  const reactExtension = '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.3.0_0';
  BrowserWindow.addDevToolsExtension(
    path.join(os.homedir(), reactExtension),
  );

  const getUrl = (fileName, isDevUrl) => (isDevUrl ? `http://localhost:1124/${fileName}` : format({
    pathname: resolve(`app/renderer/.parcel/production/${fileName}`),
    protocol: 'file:',
    slashes: true,
  }));


  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon,
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

  mainWindow.setMenu(null);
  mainWindow.loadURL(getUrl('die-line-viewer/indx.html', isDev));


  const textureWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    icon,
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
  textureWindow.loadURL(getUrl('texture-transform-editor/indx.html', isDev));
});

app.on('window-all-closed', app.quit);
