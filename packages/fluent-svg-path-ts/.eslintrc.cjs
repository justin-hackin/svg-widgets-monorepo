const sharedTsRules = require('../eslint-config-custom-ts/rules/sharedTsRules');

module.exports = {
    extends: ['eslint-config-custom-ts'],
    rules: {
        ...sharedTsRules,
        // how is this in here? airbnb-base is supposed to be for non-react
        "react/jsx-filename-extension": 0,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
    },
}
