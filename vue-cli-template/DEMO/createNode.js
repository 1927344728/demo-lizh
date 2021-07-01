const fs = require('fs');
const Path = require('path');
const Units = require('./units.js')

console.log(process.argv)
if (process.argv[2]) {
  copyTemplate(process.argv[2])
}

function copyTemplate(path) {
  const copyFiles = [ //复制demo文件
    'DEMO/template/index.html',
    'DEMO/template/app.vue',
    'DEMO/template/index.css',
    'DEMO/template/main.js'
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