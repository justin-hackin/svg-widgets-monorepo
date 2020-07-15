/* eslint-env node */

const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FuseBox, Sparky, SassPlugin, CSSPlugin, CSSResourcePlugin, CopyPlugin, JSONPlugin,
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('fuse-box');
// const { spawn } = require('child_process');
// eslint-disable-next-line import/no-extraneous-dependencies
const execa = require('execa');

const isDev = process.env.NODE_ENV !== 'production';

const ASSETS = ['*.jpg', '*.png', '*.jpeg', '*.gif', '*.svg', '*.gltf'];


Sparky.task('copy-html', () => Sparky.src('./**/*.html', { base: './app/renderer' }).dest('./dist/renderer/'));

Sparky.task('default', ['copy-html'], () => {
  const fuse = FuseBox.init({
    homeDir: 'app',
    automaticAlias: true,
    sourcemaps: true,
    useTypescriptCompiler: true,
    allowSyntheticDefaultImports: true,
    output: 'dist/$name.js',
    plugins: [
      CopyPlugin({
        useDefault: false, files: ASSETS, dest: 'static', resolve: 'static/',
      }),
      JSONPlugin(),
      [SassPlugin({ import: true }), CSSResourcePlugin(), CSSPlugin()],
      CSSPlugin(),
    ],
  });

  if (isDev) {
    fuse.dev({ port: 8080, httpServer: false });

    fuse.bundle('main/main')
      .target('electron')
      .instructions(' > [main/main.ts]')
      .watch();

    fuse.bundle('renderer/die-line-viewer/app')
      .target('electron')
      .instructions(' > [renderer/die-line-viewer/app.tsx] +fuse-box-css')
      .watch()
      .hmr();

    fuse.bundle('renderer/texture-transform-editor/app')
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

  // fuse.bundle('app/main')
  //   .target('electron')
  //   .instructions(' > [desktop/main.ts]');

  // fuse.bundle('app/renderer')
  //   .target('electron')
  //   .instructions(' > app/index.tsx');

  return fuse.run();
});
