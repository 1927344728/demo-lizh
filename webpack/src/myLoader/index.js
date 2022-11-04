const LoaderUtils = require("loader-utils");
module.exports = function(source) {
  console.log(source)
  console.log(this)
  const options = LoaderUtils.getOptions(this)
  console.log(options)
  if (this.resourcePath.match('/src/simple.js')) {
    source += `\nconsole.log("This is ${options.name}'s ${options.value}.")`
  }
  return source
};