import { contextBridge } from 'electron';
import { _electronApi } from '../../common/electronApi';

const apiKey = 'electron';

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */
contextBridge.exposeInMainWorld(apiKey, _electronApi);
