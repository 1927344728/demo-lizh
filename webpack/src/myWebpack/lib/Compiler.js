const fs = require('fs');
const path = require('path');
const { getAST, getDependencis, getCodeFromAst } = require('./parser');
module.exports = class Compiler {
  constructor(options) {
    this.entry = options.entry;
    this.output = options.output;
    this.modules = [];
  }

  run() {
    const entryModule = this.buildModule(this.entry);
    this.modules.push(entryModule);
    this.modules.map((_module) => {
      _module.dependencies.map((dependency) => {
        this.modules.push(this.buildModule(dependency));
      });
    });
    this.emitFiles();
  }

  buildModule(filename) {
    const ast = getAST(path.join(process.cwd(), 'src', filename));
    return {
      filename,
      dependencies: getDependencis(ast),
      transformCode: getCodeFromAst(ast)
    };
  }

  emitFiles() {
    const outputPath = path.join(this.output.path, this.output.filename);
    let modules = '';
    this.modules.map((_module) => {
      modules += `
        '${_module.filename}': function (require, module, exports) { ${_module.transformCode} },
      `
    });
    const bundle = `
      (function(modules) {
        function require(fileName) {
          const fn = modules[fileName];
          const module = { exports : {} };
          fn(require, module, module.exports);
          return module.exports;
        }
        require('${this.entry}');
        console.log('${new Date()}');
        console.log('This is myWebpack!');
      })({${modules}})`;
    fs.writeFileSync(outputPath, bundle, 'utf-8');
  }
};