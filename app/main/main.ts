// Basic init from https://github.com/aimerib/electron-react-parcel/
// eslint-disable-next-line import/no-extraneous-dependencies
const {
  app, BrowserWindow, nativeImage, ipcMain,
} = require('electron');
const path = require('path');
const { format } = require('url');
const debug = require('electron-debug');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDev = require('electron-is-dev');
const { resolve } = require('app-root-path');
// const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const { setupIpc } = require('./ipc');

debug();

// TODO: doesn't seem to work
const icon = nativeImage.createFromPath(`${__dirname}/build-resources/icons/png/256x256.png`);

app.on('ready', async () => {
  // TODO: monitor status of bug breaking extension installs
  // https://github.com/electron/electron/issues/23662
  // installExtension(REACT_DEVELOPER_TOOLS);
  setupIpc(ipcMain, app);

  const getUrl = (fileName) => format({
    pathname: path.join(app.getAppPath(), `dist/renderer/${fileName}`),
    protocol: 'file:',
    slashes: true,
  });

  const promisifyWindow = (config, url) => new Promise((resolveFn) => {
    const mainWindow = new BrowserWindow(config);

    mainWindow.once('ready-to-show', () => {
      mainWindow.toggleDevTools();
      mainWindow.show();
      resolveFn(mainWindow);
    });

    mainWindow.setMenu(null);
    mainWindow.loadURL(url);
  });

  const webPreferences = {
    webSecurity: false,
    nodeIntegration: true,
    preload: resolve('app/main/preload.js'),
  };

  Promise.all([
    promisifyWindow({
      width: 800,
      height: 600,
      show: false,
      icon,
      webPreferences,
    }, getUrl('die-line-viewer/app.html')),
    promisifyWindow({
      width: 800,
      height: 600,
      show: false,
      icon,
      webPreferences,
    }, getUrl('texture-transform-editor/app.html')),
  ]).then(([dieLineWindow, textureWindow]) => {
    const forwardingEvents = ['die>set-die-line-cut-holes', 'die>request-shape-update', 'tex>shape-update'];
    forwardingEvents.forEach((event) => {
      const getWindow = (eventName) => {
        if (eventName.startsWith('die>')) { return dieLineWindow; }
        if (eventName.startsWith('tex>')) { return textureWindow; }
        throw new Error('forwardingEvents items must start with \'die\'> or \'tex\'>');
      };
      ipcMain.on(event, (e, ...params) => {
        // @ts-ignore
        getWindow(event).webContents.send(event, ...params);
      });
    });
  });
});

app.on('window-all-closed', app.quit);
