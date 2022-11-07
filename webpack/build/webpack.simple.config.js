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
    new HtmlWebpackPlugin({
      template: Path.join(__dirname, `../src/index.html`),
      filename: 'index.html',
      inject: true
    }),
    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://11.url.cn/now/lib/16.2.0/react.min.js',
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: 'https://11.url.cn/now/lib/16.2.0/react-dom.min.js',
          global: 'ReactDOM',
        },
      ]
    }),
  ]
}
const compiler = Webpack(webpackConfig)
compiler.run()