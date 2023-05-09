module.exports = {
  env: {
    browser: false,
    node: true,
  },
  // javascript files config
  extends: ['airbnb-base'],
  rules: {
    'max-len': ['error', { code: 120 }],
    'no-param-reassign': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-underscore-dangle': 0,
    'func-names': 0,
    'import/no-extraneous-dependencies': 0,
  },
  overrides: [
    // typescript/react config
    {
      extends: ['airbnb', 'airbnb-typescript'],
      files: ['**/*.ts', '**/*.tsx'],
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
        'max-classes-per-file': 0,
        'max-len': ['error', { code: 120 }],
        'no-continue': 0,
        'no-param-reassign': 0,
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-underscore-dangle': 0,
        'func-names': 0,
        '@typescript-eslint/naming-convention': 0,
        '@typescript-eslint/no-shadow': 0,

        'import/extensions': 0,
        // TODO: remove dep cycles
        'import/no-cycle': 0,
        'import/no-extraneous-dependencies': 0,
        'import/prefer-default-export': 0,
        // TODO: remove below, enforce rule

        'react/jsx-props-no-spreading': 0,
        'react/no-array-index': 0,
        'react/no-array-index-key': 0,
        'react/prop-types': 0,
        'react/require-default-props': 0,
      },
    }],
};
