import EventEmitter from 'events';
import { EVENTS } from '../common/constants';

const ipcRenderer = new EventEmitter();

ipcRenderer.on(EVENTS.SELECT_TEXTURE, () => {
  console.log('selecting texture');
});

ipcRenderer.on(EVENTS.SAVE_GLB, () => {
  console.log('selecting texture');
});

ipcRenderer.on(EVENTS.SAVE_JSON, () => {
  console.log('save json');
});

ipcRenderer.on(EVENTS.DIALOG_LOAD_JSON, () => {
  console.log('load json');
});

window.globalThis.ipcRenderer = ipcRenderer;
