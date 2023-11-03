var moduleC = require('./c.js')

console.log('d' + moduleC.c)
moduleC.funcC()
module.exports = {
  d: 'd',
  funcD: function () {
    console.log('funcD')
  }
}