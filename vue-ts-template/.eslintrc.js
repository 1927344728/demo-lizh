module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    window: true,
    appBridge: true,
    Jax: true,
    wx: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-prototype-builtins': 0,
    '@typescript-eslint/no-explicit-any': 0,
    "@typescript-eslint/explicit-module-boundary-types": [
      1,
      {
        "allowArgumentsExplicitlyTypedAsAny": true
      }
    ]
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
}
