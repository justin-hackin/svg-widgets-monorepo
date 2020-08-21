/* eslint-env node */

// eslint-disable-next-line import/no-extraneous-dependencies
const { merge } = require('webpack-merge');

module.exports = function (config) {
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: /node_modules/,
          use: ['react-hot-loader/webpack'],
        },
      ],
    },
  });
};
