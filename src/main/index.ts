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
const { setupIpc, EVENTS, EVENT_TARGET_DELIMITER } = require('./ipc');

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
    const eventPrefixMap = {
      tex: textureWindow,
      die: dieLineWindow,
    };
    Object.values(EVENTS).filter((eventName:string) => eventName.includes(EVENT_TARGET_DELIMITER))
      .forEach((eventName:string) => {
        ipcMain.on(eventName, (e, ...params) => {
          const targetWindowKey = eventName.split(EVENT_TARGET_DELIMITER)[0];
          eventPrefixMap[targetWindowKey].webContents.send(eventName, ...params);
        });
      });
    // no initial shape update sent from die line viewer (texture fitting window would not be ready)
    dieLineWindow.webContents.send(EVENTS.REQUEST_SHAPE_UPDATE);
    const sendResetDragMode = () => {
      textureWindow.webContents.send(EVENTS.RESET_DRAG_MODE);
    };
    textureWindow.on('blur', sendResetDragMode);
    textureWindow.on('minimize', sendResetDragMode);
    textureWindow.on('hide', sendResetDragMode);
  });
});

app.on('window-all-closed', app.quit);
