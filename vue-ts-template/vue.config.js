const Glob = require('glob')
const Path = require('path')

const pages = {}
Glob.sync(`${__dirname}/src/pages/**/index.html`).map(ele => {
  let filePath = ele.split('/src/pages/')[1]
  filePath = Path.dirname(filePath)
  pages[filePath] = {
    entry: `src/pages/${filePath}/main.ts`,
    template: `src/pages/${filePath}/index.html`,
    filename: `${filePath}.html`
  }
})

module.exports = {
  pages,
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    externals: {
      vue: 'Vue'
    }
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV !== 'production') {
      config.module
        .rule('eslint')
        .use('eslint-loader')
        .options({
          fix: true
        })
    }
  }
}
