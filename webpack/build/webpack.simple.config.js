// const Path = require('path')
// const Webpack = require('webpack')
// const MyPlugin = require('../src/myPlugin/index.js')

// const webpackConfig = {
//   mode: 'development',
//   entry: './src/simple',
//   output: {
//     path: Path.resolve(__dirname, '../dist'),
//     filename: 'simple.js'
//   },
//   plugins: [
//     new MyPlugin()
//   ],
// }
// const compiler = Webpack(webpackConfig)
// compiler.run()

const add1 = n => n + 1;
const double = n => n * 2;
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
console.log(pipe(add1, double)(2));