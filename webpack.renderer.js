// eslint-disable-next-line import/no-extraneous-dependencies
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (config) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    const babelLoader = config.module.rules[0];
    if (!babelLoader) {
      throw new Error('could not find babel loader rule based on test is .js');
    }
    babelLoader.use.options.plugins.push([require.resolve('react-refresh/babel'), {
      skipEnvCheck: true,
    }]);
    config.plugins.push(new ReactRefreshWebpackPlugin());
  }
  return config;
};
