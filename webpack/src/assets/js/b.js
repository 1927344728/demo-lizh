var moduleA = require('./a.js')
console.log(moduleA.a)
moduleA.funcA()
module.exports = {
  b: 'b',
  funcB: function () {
    console.log('funcB')
  }
}