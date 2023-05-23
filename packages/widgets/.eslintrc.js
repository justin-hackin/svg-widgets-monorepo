const sharedTsRules = require('../eslint-config-custom/rules/sharedTsRules');

module.exports = {
  extends: ['eslint-config-custom'],
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json'],
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: ['eslint-config-airbnb', 'eslint-config-airbnb-typescript'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
        project: '**/tsconfig.json',
      },
      rules: {
        ...sharedTsRules,
        'react/jsx-props-no-spreading': 0,
        'react/prop-types': 0,
        'react/no-array-index': 0,
        'react/no-array-index-key': 0,
        'react/require-default-props': 0,
        'react/function-component-definition': 0,
      },
    },
  ],
};
