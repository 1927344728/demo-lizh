const { name } = require('./package');
const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  devServer: {
    port: 9921,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  chainWebpack: config => {
    config
    .plugin('eslint')
    .tap(args => {
      args[0].fix = true
      return args
    })
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      chunkLoadingGlobal: `webpackJsonp_${name}`, // webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
    },
  },
  transpileDependencies: true
});
