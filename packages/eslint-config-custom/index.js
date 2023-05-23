const sharedRules = require('./rules/sharedRules');
const sharedTsRules = require('./rules/sharedTsRules');

module.exports = {
  /**
   * javascript files config, all .ts* will override, keeping common rules
   * mostly for config files
   */
  extends: ['airbnb-base'],
  rules: sharedRules,
  env: {
    browser: false,
    node: true,
  },
  overrides: [
    // typescript/react config
    {
      extends: ['airbnb-base', 'airbnb-typescript'],
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: '**/tsconfig.json',
      },
      plugins: [
        '@typescript-eslint',
        'import',
      ],
      rules: sharedTsRules,
    }],
};
