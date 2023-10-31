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
    port: 9901,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  transpileDependencies: true
});
