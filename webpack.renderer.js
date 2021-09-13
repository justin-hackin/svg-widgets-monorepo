/* eslint-disable import/no-extraneous-dependencies */
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  config.plugins.push(new DefinePlugin({ 'process.env.BUILD_ENV': JSON.stringify('electron') }));

  if (isDevelopment) {
    const babelLoader = config.module.rules[0];
    babelLoader.use.options.plugins.push([require.resolve('react-refresh/babel'), {
      skipEnvCheck: true,
    }]);
    config.plugins.push(new ReactRefreshWebpackPlugin());
  }
  return config;
};
