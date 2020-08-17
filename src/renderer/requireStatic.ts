import path from 'path';
import * as url from 'url';

/**
 * Takes a file path and returns either a local filesystem path in production, or a localhost url in development.
 *
 * @see https://github.com/electron-userland/electron-webpack/issues/99#issuecomment-459251702
 * @param {string} resourcePath - filepath relative to `/static`
 * @return {string} - filepath that can be required
 */
export default function requireStatic(resourcePath) {
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-underscore-dangle
    return path.resolve(globalThis.__static, resourcePath);
  }
  return url.resolve(window.location.origin, resourcePath);
}
