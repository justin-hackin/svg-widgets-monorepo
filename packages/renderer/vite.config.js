/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env node */
import { builtinModules } from 'module';
import { join } from 'path';
import reactRefresh from '@vitejs/plugin-react-refresh';

import { chrome } from '../../electron-vendors.config.json';

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: {
      '/@/': `${join(PACKAGE_ROOT, 'src')}/`,
    },
  },
  plugins: [reactRefresh()],
  base: '',
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: 'dist',
    assetsDir: '.',
    assetsInclude: ['**/*.gltf'],
    dynamicImportVarsOptions: {
      include: ['static/**/*.jpg', 'static/**/*.png'],
    },
    terserOptions: {
      ecma: 2020,
      compress: {
        passes: 2,
      },
      safari10: false,
    },
    rollupOptions: {
      external: [
        ...builtinModules,
      ],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
