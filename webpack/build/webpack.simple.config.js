const Path = require('path')
const Webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')


const webpackConfig = {
  mode: 'development',
  entry: './src/simple.js',
  output: {
    path: Path.resolve(__dirname, '../dist'),
    filename: 'simple.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'vue',
          entry: 'https://unpkg.com/vue@3/dist/vue.global.js',
          global: 'Vue',
        },
        {
          // /node_modules/atob/node-atob.js
          module: 'atob',
          entry: 'node-atob.js',
          global: 'AToB',
        },
      ]
    }),
  ]
}
const compiler = Webpack(webpackConfig)
compiler.run()