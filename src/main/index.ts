const {
  app, BrowserWindow, nativeImage, nativeTheme, ipcMain, screen: electronScreen,
} = require('electron');
const path = require('path');
const { format } = require('url');
const debug = require('electron-debug');

const {
  setupIpc, EVENTS, ROUTES,
} = require('./ipc');

const isDevelopment = process.env.NODE_ENV !== 'production';

// for debugging prod build, temporarily add isEnabled: true
debug({ showDevTools: false });

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

  const browserWindow = new BrowserWindow({
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
  });

  nativeTheme.themeSource = 'dark';
  browserWindow.setMenu(null);

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  const sendResetDragMode = () => {
    browserWindow.webContents.send(EVENTS.RESET_DRAG_MODE);
  };
  browserWindow.on('blur', sendResetDragMode);
  browserWindow.on('minimize', sendResetDragMode);
  browserWindow.on('hide', sendResetDragMode);

  const DEFAULT_HASH_FRAGMENT = `#/${ROUTES.TEXTURE_EDITOR}`;
  await browserWindow.loadURL(isDevelopment
    ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}${DEFAULT_HASH_FRAGMENT}`
    : `${format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    })}${DEFAULT_HASH_FRAGMENT}`);
});

app.on('window-all-closed', app.quit);
