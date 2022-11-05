const Path = require('path')
const Webpack = require('../src/myWebpack/index.js')

const webpackConfig = {
  mode: 'development',
  entry: './simple.js',
  output: {
    path: Path.resolve(__dirname, '../dist'),
    filename: 'simple.js'
  }
}
const compiler = Webpack(webpackConfig)
compiler.run()