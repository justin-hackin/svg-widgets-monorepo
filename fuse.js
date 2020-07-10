/* eslint-env node */

const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FuseBox, Sparky, CSSPlugin, CSSResourcePlugin, WebIndexPlugin, RawPlugin, CopyPlugin,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('fuse-box');
// const { spawn } = require('child_process');
// eslint-disable-next-line import/no-extraneous-dependencies
const execa = require('execa');

const isDev = process.env.NODE_ENV !== 'production';

const ASSETS = ['*.jpg', '*.png', '*.jpeg', '*.gif', '*.svg', '*.gltf'];


Sparky.task('copy-html', () => Sparky.src('./**/*.html', { base: './src/app/renderer' }).dest('./dist/renderer/'));

Sparky.task('default', ['copy-html'], () => {
  const fuse = FuseBox.init({
    homeDir: 'src/app',
    automaticAlias: true,
    sourcemaps: true,
    useTypescriptCompiler: true,
    allowSyntheticDefaultImports: true,
    output: 'dist/$name.js',
    plugins: [
      [CSSResourcePlugin(), CSSPlugin()], CSSPlugin()],
    alias: {
      '@coglite': '~/packages',
    },
  });

  if (isDev) {
    fuse.dev({ port: 8085, httpServer: false });

    fuse.bundle('main')
      .target('electron')
      .instructions(' > [main/main.ts]')
      .watch();

    fuse.bundle('renderer/die-line-viewer')
      .target('electron')
      .instructions(' > [app/renderer/die-line-viewer/app.tsx] +fuse-box-css')
      .watch()
      .hmr()
      .plugin(CopyPlugin({
        useDefault: false, files: ASSETS, dest: 'app/static', resolve: '/',
      }));

    fuse.bundle('renderer/texture-transform-editor')
      .target('electron')
      .instructions(' > [renderer/texture-transform-editor/app.tsx] +fuse-box-css')
      .watch()
      .hmr();


    return fuse.run().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const child = execa('node', [`${__dirname}/node_modules/electron/cli.js`, __dirname], { stdio: 'inherit' })
        .on('close', () => { process.exit(); })
        // eslint-disable-next-line no-console
        .on('data', (data) => { console.log(`electron > ${data}`); });
    });
  }

  // ------------------prod config here..needs some work but doesnt matter atm-----------------------//

  fuse.bundle('app/main')
    .target('electron')
    .instructions(' > [desktop/main.ts]');

  fuse.bundle('app/renderer')
    .target('electron')
    .instructions(' > app/index.tsx');

  return fuse.run();
});
