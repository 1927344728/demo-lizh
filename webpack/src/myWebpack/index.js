const Compiler = require('./lib/Compiler.js');
module.exports = function webpack (options) {
  return new Compiler(options)
}