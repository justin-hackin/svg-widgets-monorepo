
/**
 *
 * @type {{extends: string[], files: string[], rules: {"max-len": [string,{code: number}], "func-names": number, "no-param-reassign": number, "no-underscore-dangle": number, "no-restricted-syntax": string[]}, overrides: [{env: {node: boolean, browser: boolean}},{settings: {"import/resolver": {typescript: {project: string[]}}}, parserOptions: {ecmaVersion: number, sourceType: string, project: string, ecmaFeatures: {jsx: boolean}}, extends: string[], parser: string, plugins: string[], files: string[], rules: {"func-names": number, "no-continue": number, "no-underscore-dangle": number, "react/require-default-props": number, "react/prop-types": number, "@typescript-eslint/no-shadow": number, "no-restricted-syntax": string[], "@typescript-eslint/naming-convention": number, "import/prefer-default-export": number, "max-classes-per-file": number, "import/no-extraneous-dependencies": number, "max-len": [string,{code: number}], "react/jsx-props-no-spreading": number, "import/extensions": [string,string,{"": string, tsx: string, js: string, jsx: string, ts: string}], "react/no-array-index": number, "no-param-reassign": number, "react/no-array-index-key": number, "react/function-component-definition": number}}]}}
 */
module.exports = {
  /**
   * javascript files config, all .ts* will override, keeping common rules
   * mostly for config files
   */
  ignorePattern: [
    'node_modules/**/*',
    '**/dist/**/*',
    '**/docs-site/**/*',
  ],
  extends: ['airbnb-base'],
  rules: {
    'max-len': ['error', { code: 120 }],
    'max-classes-per-file': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    'no-underscore-dangle': 0,
    'func-names': 0,
    'no-continue': 0,
  },
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
        // TODO: remove below, enforce rule
        '@typescript-eslint/no-shadow': 0,
      },
    }],
};
