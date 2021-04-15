import path from 'path';
import * as url from 'url';
import { IS_PRODUCTION_BUILD, IS_WEB_BUILD } from '../common/constants';

/**
 * Takes a file path and returns either a local filesystem path in production, or a localhost url in development.
 *
 * @see https://github.com/electron-userland/electron-webpack/issues/99#issuecomment-459251702
 * @param {string} resourcePath - filepath relative to `/static`
 * @return {string} - filepath that can be required
 */
export default function requireStatic(resourcePath) {
  if (IS_WEB_BUILD) {
    return `static/${resourcePath}`;
  }
  if (IS_PRODUCTION_BUILD) {
    // @ts-ignore
    return path.resolve(__static, resourcePath);
  }
  return url.resolve(window.location.origin, resourcePath);
}
