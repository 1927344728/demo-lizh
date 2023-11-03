var moduleD = require('./d.js')

console.log('c' + moduleD.d)
moduleD.funcD()
module.exports = {
  c: 'c',
  funcC: function () {
    console.log('funcC')
  }
}