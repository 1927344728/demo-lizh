const Glob = require('glob')
const Path = require('path')

const pages = {
  index: {
    entry: 'src/main.js',
    template: 'public/index.html',
    filename: 'index.html',
    chunks: ['chunk-vendors', 'chunk-common']
  }
}

Glob.sync('./src/pages/**/index.html').map(ele => {
  let filePath = ele.replace('./src/pages/', '')
  filePath = Path.dirname(filePath)
  console.log(filePath)
  pages[filePath] = {
    entry: `src/pages/${filePath}/main.js`,
    template: `src/pages/${filePath}/index.html`,
    filename: `${filePath}.html`
  }
})
console.log(pages)
module.exports = {
  assetsDir: './assetsDir', //build后，静态资源的存放目录
  pages
  // pages: {
  //     index: {
  //         // page 的入口
  //         entry: 'src/pages/planbookInfo/main.js',
  //         // 模板来源
  //         template: 'src/pages/planbookInfo/index.html',
  //         // 在 dist/index.html 的输出
  //         filename: 'planbookInfo/index.html',

  //         // 在这个页面中包含的块，默认情况下会包含
  //         // 提取出来的通用 chunk 和 vendor chunk。
  //         chunks: ['chunk-vendors', 'chunk-common', 'index']
  //     }
  // }
}
