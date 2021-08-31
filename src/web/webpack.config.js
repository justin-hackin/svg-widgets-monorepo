const { merge } = require('webpack-merge');
// eslint-disable-next-line import/no-unresolved
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');
const ReactRefreshBabel = require('react-refresh/babel');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

// in order to preserve electron-webpack structure for static files
// project root is made context
const context = resolve(__dirname, '../..');
const devConfig = {
  devServer: {
    contentBase: context,
    historyApiFallback: true,
    compress: true,
    port: 8080,
    watchContentBase: true,
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
};

const prodConfig = {
  output: {
    filename: 'js/bundle.[contenthash].min.js',
    path: resolve(context, '_static'),
    publicPath: '/',
  },
  devtool: 'source-map',
};

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  const commonConfig = {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    context,
    entry: './src/web/index.tsx',
    module: {
      rules: [
        {
          test: [/\.jsx?$/, /\.tsx?$/],
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
                '@babel/preset-flow',
              ],
              plugins: [...(isProd ? null : [ReactRefreshBabel]),
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                '@babel/plugin-transform-runtime',
              ],
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]',
            'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false',
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'src/web/index.html.ejs' }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'static', to: 'static' }],
      }),
      new DefinePlugin({
        'process.env.BUILD_ENV': JSON.stringify('web'),
      }),
    ],
    performance: {
      hints: false,
    },
  };
  return merge(commonConfig, isProd ? prodConfig : devConfig);
};
