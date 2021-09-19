/* eslint-disable no-console */
import { join } from 'path';
import {
  app, BrowserWindow, ipcMain, nativeImage, nativeTheme, screen,
} from 'electron';
import debug from 'electron-debug';
import { EVENTS } from '../../common/constants';
import { setupIpc } from './ipc';
import icon from '../../../buildResources/icons/png/512x512.png';

const nativeImageIcon = nativeImage.createFromDataURL(icon);

// for debugging prod build, temporarily add isEnabled: true
debug({ showDevTools: false, isEnabled: true });

if (import.meta.env.MODE === 'development') {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(async ({ default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS }) => {
      await installExtension(REACT_DEVELOPER_TOOLS);
      await installExtension(REDUX_DEVTOOLS);
    })
    .catch((e) => console.error('Failed install extension:', e));
}

app.on('ready', async () => {
  // Install "Vue.js devtools"

  setupIpc(ipcMain);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const browserWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    show: false,
    darkTheme: true,
    icon: nativeImageIcon,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      // @ts-ignore
      preload: join(__dirname, '../../preload/dist/index.cjs'),
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

  const pageUrl = (import.meta.env.MODE === 'development' && import.meta.env.VITE_DEV_SERVER_URL !== undefined)
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', `file://${__dirname}`).toString();

  // @ts-ignore
  await browserWindow.loadURL(pageUrl);
});

app.on('window-all-closed', app.quit);

// Auto-updates
if (import.meta.env.PROD) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e));
}
