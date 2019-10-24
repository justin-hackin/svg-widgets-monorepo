module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  globals: {
    document: true,
  },
  rules: {
    'import/prefer-default-export': 0,
    'max-len': ['error', {code: 120}],
    'react/jsx-props-no-spreading': 0,
    // TODO: convert to ts or remove following
    'react/prop-types': 0,
  },
  parserOptions: {
    ecmaVersion: 11,
    allowImportExportEverywhere: true
  }
};
