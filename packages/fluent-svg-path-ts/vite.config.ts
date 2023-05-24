/* eslint-disable import/no-extraneous-dependencies */
// vite.config.ts
/* eslint-env node */
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'fluent-svg-path-ts',
    },
  },
});
