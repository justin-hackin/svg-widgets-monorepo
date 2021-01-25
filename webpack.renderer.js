/* eslint-env node */
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (config) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    const babelLoader = config.module.rules[0];
    babelLoader.use.options.plugins.push([require.resolve('react-refresh/babel'), {
      skipEnvCheck: true,
    }]);
    config.plugins.push(new ReactRefreshWebpackPlugin());
  }
  return config;
};
