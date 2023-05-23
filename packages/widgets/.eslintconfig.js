module.exports = {
  extends: ['eslint-config-custom'],
  overrides:[
    {
      files: ['**/*.ts', '**/*.ts'],
      extends: ['eslint-config-airbnb'],
      rules: {
        'react/jsx-props-no-spreading': 0,
        'react/prop-types': 0,
        'react/no-array-index': 0,
        'react/no-array-index-key': 0,
        'react/require-default-props': 0,
        'react/function-component-definition': 0,
      }
    }
  ]
}
