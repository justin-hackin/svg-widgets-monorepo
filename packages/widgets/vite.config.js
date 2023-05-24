/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env node */
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';
import path from 'path';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */

export default defineConfig(({ mode }) => ({
  mode,
  root: PACKAGE_ROOT,
  plugins: [
    // universal plugins here
    ...(mode === 'development' ? [
      // development-only plugins here
      reactRefresh(),
    ] : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    assetsDir: '.',
    dynamicImportVarsOptions: {
      include: ['**/static/**/*.jpg', '**/static/**/*.png', '**/static/**/*.gltf'],
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
    emptyOutDir: true,
    reportCompressedSize: false,
  },
}
));
