/* eslint-env node */
// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');

// eslint-disable-next-line import/no-extraneous-dependencies
const { merge } = require('webpack-merge');

module.exports = function (config) {
  const htmlPlugin = config.plugins.find((plugin) => plugin instanceof HtmlWebpackPlugin);
  htmlPlugin.options.template = 'src/renderer/index.ejs';
  const { templateParameters } = htmlPlugin.options;

  htmlPlugin.options.templateParameters = (...params) => merge(
    {
      isDev: process.env.NODE_ENV !== 'production',
      electronHeadScript: `<script>
      ${htmlPlugin.nodeModules == null
    ? ''
    : `require("module").globalPaths.push("${htmlPlugin.nodeModules.replace(/\\/g, '/')}")`}
      require("source-map-support/source-map-support.js").install()
    </script>`,
    }, templateParameters(...params),
  );

  return config;
};
