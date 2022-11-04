const fs = require("fs");
const path = require("path");
const { runLoaders } = require("loader-runner");
runLoaders(
  {
    resource: path.resolve(__dirname,  "../simple.js"),
    loaders: [
      path.resolve(__dirname, "./index.js?name=Lizhao&value=MyLoader")
    ],
    readResource: fs.readFile.bind(fs)
  },
  (err, result) => {
    if (err) {
      console.error(err)
      return
    }
    console.log(result.result)
    return result
  }
);