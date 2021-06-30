module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-undef': 0,
    'prefer-promise-reject-errors': 0,
    'eqeqeq': 0,
    'comma-dangle': 0,
    'spaced-comment': 0,
    'no-multi-spaces': 0,
    'quotes': 0,
    'no-unreachable': 0,

    'no-unused-vars': 0,
    'no-mixed-spaces-and-tabs': 0,
    'no-useless-escape': 0,
    'no-extra-boolean-cast': 0,
    'no-empty': 0,
    'no-irregular-whitespace': 0,

    'vue/no-use-v-if-with-v-for': 0,
    'vue/valid-v-for': 0,
    'vue/no-unused-vars': 0,
    'vue/no-unused-components': 0,
    'vue/require-component-is': 0,
    'vue/require-v-for-key': 0,
    'vue/no-parsing-error': 0,
    'vue/no-side-effects-in-computed-properties': 0,
    'vue/valid-v-on': 0,
    'vue/valid-v-bind': 0,
    'vue/no-async-in-computed-properties': 0,
    'vue/valid-v-if': 0

  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
