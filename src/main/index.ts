const {
  app, BrowserWindow, BrowserWindowConstructorOptions, nativeImage, ipcMain, screen: electronScreen,
} = require('electron');
const path = require('path');
const { format } = require('url');
const debug = require('electron-debug');

const isDevelopment = process.env.NODE_ENV !== 'production';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isDev = require('electron-is-dev');
// const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const { setupIpc } = require('./ipc');

// TODO: remove isEnabled once builder works
debug({ showDevTools: false, isEnabled: true });

// TODO: doesn't seem to work
// @ts-ignore
const icon = nativeImage.createFromPath(`${path.resolve(__static, '..')}/build/icons/256x256.png`);

app.on('ready', async () => {
  // TODO: monitor status of bug breaking extension installs
  // https://github.com/electron/electron/issues/23662
  // installExtension(REACT_DEVELOPER_TOOLS);
  setupIpc(ipcMain, app);
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  const promisifyWindow = (
    config: typeof BrowserWindowConstructorOptions, route: string,
  ): Promise<typeof BrowserWindow> => new Promise((resolveFn) => {
    const mainWindow = new BrowserWindow(config);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      resolveFn(mainWindow);
    });

    mainWindow.setMenu(null);

    const hashFragment = `#/${route}`;
    mainWindow.loadURL(isDevelopment
      ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}${hashFragment}`
      : `${format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })}${hashFragment}`);
  });

  const webPreferences = {
    webSecurity: false,
    nodeIntegration: true,
    // @ts-ignore
    preload: path.resolve(__static, 'preload.js'),
  };

  Promise.all([
    promisifyWindow({
      width: width / 2,
      x: 0,
      y: 0,
      height,
      show: false,
      title: 'SpaceCraft Net Factory - Dieline Viewer',
      icon,
      webPreferences,
    }, 'die-line-viewer'),
    promisifyWindow({
      width: width / 2,
      x: width / 2,
      y: 0,
      height,
      show: false,
      title: 'SpaceCraft Net Factory - Texture Fitting',
      icon,
      webPreferences,
    }, 'texture-transform-editor'),
  ]).then(([dieLineWindow, textureWindow]:[typeof BrowserWindow, typeof BrowserWindow]) => {
    const forwardingEvents = ['die>set-die-line-cut-holes', 'die>request-shape-update', 'tex>shape-update'];
    forwardingEvents.forEach((event) => {
      const getWindow = (eventName) => {
        if (eventName.startsWith('die>')) { return dieLineWindow; }
        if (eventName.startsWith('tex>')) { return textureWindow; }
        throw new Error('forwardingEvents items must start with \'die\'> or \'tex\'>');
      };
      ipcMain.on(event, (e, ...params) => {
        getWindow(event).webContents.send(event, ...params);
      });
    });
    // no initial shape update sent from die line viewer (texture fitting window would not be ready)
    dieLineWindow.webContents.send('die>request-shape-update');
    const sendResetDragMode = () => {
      textureWindow.webContents.send('reset-drag-mode');
    };
    textureWindow.on('blur', sendResetDragMode);
    textureWindow.on('minimize', sendResetDragMode);
    textureWindow.on('hide', sendResetDragMode);
  });
});

app.on('window-all-closed', app.quit);
