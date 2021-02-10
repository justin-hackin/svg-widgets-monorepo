const {
  app, BrowserWindow, BrowserWindowConstructorOptions, nativeImage, nativeTheme, ipcMain, screen: electronScreen,
} = require('electron');
const path = require('path');
const { format } = require('url');
const debug = require('electron-debug');

const {
  setupIpc, EVENTS, WINDOWS, ROUTED_EVENT_MAP,
} = require('./ipc');

type BrowserWindowType = (typeof BrowserWindow);

interface windowMappingObject {
  [key: string]: BrowserWindowType;
}

export interface CustomBrowserWindowType extends BrowserWindowType {
  route: typeof WINDOWS
}

const isDevelopment = process.env.NODE_ENV !== 'production';

// for debugging build, add isEnabled: true
debug({ showDevTools: false, isEnabled: true });

// @ts-ignore
const icon = nativeImage.createFromPath(`${path.resolve(__static, '..')}/build/icons/256x256.png`);
app.on('ready', async () => {
  if (isDevelopment) {
    // electron-devtools-installer is a devDependency so don't import at top
    const {
      default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS,
      // eslint-disable-next-line global-require
    } = require('electron-devtools-installer');
    // this works but main process emits:  (node:42552) ExtensionLoadWarning...
    // see https://github.com/electron/electron/issues/23662
    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]);
  }
  setupIpc(ipcMain);
  const { width, height } = electronScreen.getPrimaryDisplay().workAreaSize;

  const browserWindows:windowMappingObject = {};
  const routedEventListeners = {};

  const addEventListenersForWindow = (windowKey) => {
    ROUTED_EVENT_MAP[windowKey].forEach((eventName:string) => {
      routedEventListeners[eventName] = (e, ...params) => {
        const targetWindow:(typeof BrowserWindow) = browserWindows[windowKey];
        if (targetWindow) {
          targetWindow.webContents.send(eventName, ...params);
        }
      };
      ipcMain.on(eventName, routedEventListeners[eventName]);
    });
  };

  const removeEventListenersForWindow = (windowKey) => {
    ROUTED_EVENT_MAP[windowKey].forEach((eventName:string) => {
      ipcMain.removeListener(eventName, routedEventListeners[eventName]);
    });
  };

  const promisifyWindow = (
    config: typeof BrowserWindowConstructorOptions, route: string,
  ): Promise<typeof BrowserWindow> => new Promise((resolveFn) => {
    browserWindows[route] = new BrowserWindow({
      x: 0,
      y: 0,
      width,
      height,
      show: false,
      icon,
      darkTheme: true,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        // @ts-ignore
        preload: path.resolve(__static, 'preload.js'),
      },
      ...config,
    });

    nativeTheme.themeSource = 'dark';
    browserWindows[route].setMenu(null);
    browserWindows[route].route = route;

    addEventListenersForWindow(route);

    browserWindows[route].once('ready-to-show', () => {
      browserWindows[route].show();
      resolveFn();
    });

    browserWindows[route].on('close', () => {
      removeEventListenersForWindow(route);
    });

    const hashFragment = `#/${route}`;
    browserWindows[route].loadURL(isDevelopment
      ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}${hashFragment}`
      : `${format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })}${hashFragment}`);
  });

  await promisifyWindow({
    minWidth: 1000,
    minHeight: 570,
  }, WINDOWS.DIELINE_EDITOR);

  const assignTextureWindow = async () => {
    await promisifyWindow({
      minWidth: 730,
      minHeight: 730,
      closable: false,
    }, WINDOWS.TEXTURE_EDITOR);
  };
  await assignTextureWindow();

  ipcMain.on(EVENTS.OPEN_TEXTURE_WINDOW, async () => {
    if (!browserWindows[WINDOWS.TEXTURE_EDITOR]) {
      await assignTextureWindow();
      browserWindows[WINDOWS.TEXTURE_EDITOR].show();
    } else if (browserWindows[WINDOWS.TEXTURE_EDITOR].isMinimized()) {
      browserWindows[WINDOWS.TEXTURE_EDITOR].restore();
    } else if (!browserWindows[WINDOWS.TEXTURE_EDITOR].isVisible()) {
      browserWindows[WINDOWS.TEXTURE_EDITOR].show();
    } else {
      browserWindows[WINDOWS.TEXTURE_EDITOR].focus();
    }
  });

  browserWindows[WINDOWS.DIELINE_EDITOR].on('close', () => {
    removeEventListenersForWindow(WINDOWS.DIELINE_EDITOR);
    if (browserWindows[WINDOWS.TEXTURE_EDITOR]) {
      browserWindows[WINDOWS.TEXTURE_EDITOR].close();
    }
  });

  browserWindows[WINDOWS.TEXTURE_EDITOR].on('close', () => {
    browserWindows[WINDOWS.TEXTURE_EDITOR] = undefined;
  });

  const sendResetDragMode = () => {
    browserWindows[WINDOWS.TEXTURE_EDITOR].webContents.send(EVENTS.RESET_DRAG_MODE);
  };
  browserWindows[WINDOWS.TEXTURE_EDITOR].on('blur', sendResetDragMode);
  browserWindows[WINDOWS.TEXTURE_EDITOR].on('minimize', sendResetDragMode);
  browserWindows[WINDOWS.TEXTURE_EDITOR].on('hide', sendResetDragMode);

  browserWindows[WINDOWS.DIELINE_EDITOR].show();
});

app.on('window-all-closed', app.quit);
