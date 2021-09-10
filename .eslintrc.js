module.exports = {
  extends: ['airbnb', 'airbnb-typescript'],
  // see https://github.com/iamturns/eslint-config-airbnb-typescript for peer dependencies
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'import/prefer-default-export': 0,
    'max-len': ['error', { code: 120 }],
    // TODO: remove below, enforce rule
    'max-classes-per-file': 0,
    'react/jsx-props-no-spreading': 0,
    'react/prop-types': 0,
    'react/no-array-index': 0,
    'react/no-array-index-key': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-continue': 0,
    'no-underscore-dangle': 0,
    // TODO: remove dep cycles
    'import/no-cycle': 0,
    'func-names': 0,
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-shadow': 0,
  },
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'react/jsx-filename-extension': [1, {
      extensions: ['.jsx', '.tsx'],
    }],
  },
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  globals: {
    __static: true,
    dataLayer: true,
  },
};
