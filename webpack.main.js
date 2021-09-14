/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env node */
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { DefinePlugin } = require('webpack');

module.exports = function (config, configurator) {
  config.plugins.push(new DefinePlugin({ 'process.env.BUILD_ENV': JSON.stringify('electron') }));

  if (configurator.isProduction) {
    config.plugins.push(new CopyWebpackPlugin({
      patterns:
        [{
          from: 'build/icons/',
          to: '../icons',
        }],
    }));
  }

  return config;
};
