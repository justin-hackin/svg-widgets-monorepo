const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

// development options for babel are defined in commonConfig's inline babel config
// because of the difficulty of merging webpack rule.options.plugins
const commonConfig = require('./common');

const devConfig = merge(commonConfig, {
  mode: 'development',
  entry: [
    // the entry point of our app
    './src/web/index.tsx',
  ],
  devServer: {
    contentBase: commonConfig.context,
    hot: true,
    inline: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    stats: 'minimal',
    clientLogLevel: 'warning',
  },
  devtool: 'cheap-module-eval-source-map',

  plugins: [
    new HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
});
module.exports = devConfig;
