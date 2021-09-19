/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env node */
import { builtinModules } from 'module';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

import { chrome } from '../../electron-vendors.config.json';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */

const htmlPlugin = (mode) => ({
  name: 'html-transform',
  transformIndexHtml() {
    const isWeb = mode === 'web';
    return [
      ...(isWeb ? [
      //  TODO: google analytics
      ] : [{
        tag: 'meta',
        attrs: {
          'http-equiv': 'Content-Security-Policy',
          content: "script-src 'self' blob:",
        },
        injectTo: 'head',
      }])];
  },
});

export default defineConfig(({ mode }) => ({
  mode,
  root: PACKAGE_ROOT,
  plugins: [
    htmlPlugin(mode),
    ...(mode === 'development' ? [reactRefresh()] : []),
  ],
  base: '',
  server: mode === 'web' ? undefined : {
    fs: {
      strict: true,
    },
  },
  assetsInclude: ['**/*.gltf'],
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: mode === 'web' ? '../../_static' : 'dist',
    assetsDir: '.',
    dynamicImportVarsOptions: {
      include: ['static/**/*.jpg', 'static/**/*.png', 'static/**/*.gltf'],
    },
    // web mode is also for production
    minify: mode === 'development' ? false : 'terser',
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2,
      },
      safari10: false,
    },
    rollupOptions: {
      external: [
        ...(mode === 'web' ? [] : builtinModules),
      ],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
}
));
