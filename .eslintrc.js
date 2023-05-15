const commonRules = {
  'max-len': ['error', { code: 120 }],
  'no-param-reassign': 0,
  'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
  'no-underscore-dangle': 0,
  'func-names': 0,
};

module.exports = {
  overrides: [
    {
      files: ['**/*.js'],
      env: {
        browser: false,
        node: true,
      },
      // javascript files config
      extends: ['airbnb-base'],
      rules: {
        ...commonRules,
      },
    },
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
      plugins: [
        '@typescript-eslint',
        'import',
      ],
      settings: {
        'import/resolver': {
          typescript: {
            project: ['tsconfig.json'],
          },
        },
      },
      rules: {
        ...commonRules,
        '@typescript-eslint/naming-convention': 0,
        'import/prefer-default-export': 0,
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            // https://stackoverflow.com/a/72643821
            '': 'never',
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
        'import/no-extraneous-dependencies': 1,
        'max-len': ['error', { code: 120 }],
        // TODO: remove below, enforce rule
        'max-classes-per-file': 0,
        'react/jsx-props-no-spreading': 0,
        'react/prop-types': 0,
        'react/no-array-index': 0,
        'react/no-array-index-key': 0,
        'react/require-default-props': 0,
        'react/function-component-definition': 0,
        'no-param-reassign': 0,
        'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
        'no-continue': 0,
        'no-underscore-dangle': 0,
        'func-names': 0,
        '@typescript-eslint/no-shadow': 0,
      },
    }],
};
