module.exports = {
  extends: 'airbnb-typescript',
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'import/prefer-default-export': 0,
    'max-len': ['error', {code: 120}],
    'react/jsx-props-no-spreading': 0,
    // TODO: convert to ts or remove following
    'react/prop-types': 0,
    'react/no-array-index': 0,
    'react/no-array-index-key': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-continue': 0,
  },
  settings: {
    'import/extensions': [".js",".jsx",".ts",".tsx"],
    'import/parsers': {
      '@typescript-eslint/parser': [".ts",".tsx"]
    },

    "import/resolver": {
      // use <root>/tsconfig.json
      "typescript": {
        "alwaysTryTypes": true // always try to resolve types under `<roo/>@types` directory even it doesn't contain any source code, like `@types/unist`
      },

      // use <root>/path/to/folder/tsconfig.json
      "typescript": {
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
