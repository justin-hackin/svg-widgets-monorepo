/* eslint-env node */
// eslint-disable-next-line import/no-extraneous-dependencies
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (config, configurator) {
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
