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
  interface windowMappingObject {
    [key: string]: (typeof BrowserWindow);
  }
  const browserWindows:windowMappingObject = {};
  const routedEventListeners = {};

  const getRoutedEventsByPrefix = (windowPrefix) => Object.values(EVENTS)
    .filter((eventName:string) => eventName.startsWith(`${windowPrefix}${EVENT_TARGET_DELIMITER}`));

  const addEventListenersForWindow = (windowPrefix) => {
    getRoutedEventsByPrefix(windowPrefix).forEach((eventName:string) => {
      routedEventListeners[eventName] = (e, ...params) => {
        const targetWindowKey = eventName.split(EVENT_TARGET_DELIMITER)[0];
        const targetWindow:(typeof BrowserWindow) = browserWindows[targetWindowKey];
        if (targetWindow) {
          targetWindow.webContents.send(eventName, ...params);
        }
      };
      ipcMain.on(eventName, routedEventListeners[eventName]);
    });
  };

  const removeEventListenersForWindow = (windowPrefix) => {
    getRoutedEventsByPrefix(windowPrefix).forEach((eventName:string) => {
      ipcMain.removeListener(eventName, routedEventListeners[eventName]);
    });
  };

  browserWindows.die = await promisifyWindow({
    width: width / 2,
    x: 0,
    y: 0,
    height,
    show: false,
    title: 'SpaceCraft Net Factory - Dieline Viewer',
    icon,
    webPreferences,
  }, 'die-line-viewer');
  addEventListenersForWindow('die');

  const assignTextureWindow = async () => {
    if (browserWindows.tex) {
      removeEventListenersForWindow('tex');
    }
    browserWindows.tex = await promisifyWindow({
      width: width / 2,
      x: width / 2,
      y: 0,
      height,
      show: false,
      title: 'SpaceCraft Net Factory - Texture Fitting',
      icon,
      webPreferences,
    }, 'texture-transform-editor');
    addEventListenersForWindow('tex');
    browserWindows.die.webContents.send(EVENTS.REQUEST_SHAPE_UPDATE);
  };
  await assignTextureWindow();

  ipcMain.on(EVENTS.OPEN_TEXTURE_WINDOW, () => {
    assignTextureWindow();
  });

  browserWindows.die.on('close', () => {
    removeEventListenersForWindow('die');
    browserWindows.tex.close();
    removeEventListenersForWindow('tex');
  });


  const sendResetDragMode = () => {
    browserWindows.tex.webContents.send(EVENTS.RESET_DRAG_MODE);
  };
  browserWindows.tex.on('blur', sendResetDragMode);
  browserWindows.tex.on('minimize', sendResetDragMode);
  browserWindows.tex.on('hide', sendResetDragMode);
});

app.on('window-all-closed', app.quit);
