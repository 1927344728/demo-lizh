var moduleB = require('./b.js')
console.log(moduleB.b)
moduleB.funcB()
module.exports = {
  a: 'a',
  funcA: function () {
    console.log('funcA')
  }
}