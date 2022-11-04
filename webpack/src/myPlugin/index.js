const { RawSource } = require("webpack-sources");
module.exports = class myPlugin {
  constructor(options) {
    this.options = options;
    console.log("This is Lizhao's plugin.");
  }
  apply(compiler) {
    compiler.hooks.emit.tap(
      'myPlugin',
      (compilation) => {
        try {
          const filename = compilation.outputOptions.filename;
          const asset = compilation.assets[filename];
          const content = `
            /**
              Author: Lizhao
              UpdateTime: ${new Date().toString()}
            **/
          ` + asset.source();
          compilation.assets[filename] = new RawSource(content);
          console.log('This is emit hook!');
        } catch (err) {
          compilation.errors.push("error");
          console.error(err)
        }
      }
    );
  }
}