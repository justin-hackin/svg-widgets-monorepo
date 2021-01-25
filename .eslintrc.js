module.exports = {
  extends: 'airbnb-typescript',
  // the following packages are required as peer dependencies for this config:
  // eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin
  // see https://github.com/iamturns/eslint-config-airbnb-typescript
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'import/prefer-default-export': 0,
    'max-len': ['error', {code: 120}],
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
  },
  settings: {
    'import/extensions': [".js",".jsx",".ts",".tsx"],
    'import/parsers': {
      '@typescript-eslint/parser': [".ts",".tsx"]
    },

    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "directory": "."
      },
    },
    "react/jsx-filename-extension": [1, {
      "extensions": [".jsx", ".tsx"]
    }],
  },
  parserOptions: {
    ecmaVersion: 11,
    allowImportExportEverywhere: true
  },
  globals: {
    '__static': true,
  }
};
