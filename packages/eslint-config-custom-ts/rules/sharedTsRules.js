const sharedRules = require("./sharedRules");

module.exports = {
    ...sharedRules,
    '@typescript-eslint/naming-convention': 0,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 1,
    // TODO: remove below, enforce rule
    '@typescript-eslint/no-shadow': 0,
}
