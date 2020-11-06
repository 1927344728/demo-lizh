const fs = require('fs');
const Path = require('path');
const Units = require('./units.js')

console.log(process.argv)
if (process.argv[2]) {
  copyTemplate(process.argv[2])
} else {
  Units.nodeRunWarning()
}

function copyTemplate(path) {
  const copyFiles = [ //复制demo文件
    'userConf/template/index.html',
    'userConf/template/index.vue',
    'userConf/template/index.css',
    'userConf/template/main.js'
  ]
  Units.mkdirsSync(`src/pages/${path}`)

  copyFiles.forEach(ele => { //复制文件
    let filePath = `src/pages/${path}/${Path.basename(ele)}`
    if (fs.existsSync(filePath)) {
      console.log('该文件已存在:' + filePath)
    } else {
      fs.writeFileSync(filePath, fs.readFileSync(ele));
    }
  })
  console.log('文件创建在src/pages文件夹下')
}