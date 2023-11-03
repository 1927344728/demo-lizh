const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  chainWebpack: config => {
    config
    .plugin('eslint')
    .tap(args => {
      args[0].fix = true
      return args
    })
  },
  devServer: {
    port: 9910
  },
  transpileDependencies: true
});
