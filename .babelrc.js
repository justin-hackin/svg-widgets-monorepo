module.exports = {
  "plugins": [
    // NOTE reason for adding @babel/plugin-proposal-decorators to dependencies not devDependencies:
    // https://github.com/electron-userland/electron-webpack/issues/251#issuecomment-504693323
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
  ]
};
