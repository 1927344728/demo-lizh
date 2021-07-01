const fs = require('fs');
const Path = require('path');
const Units = require('./units.js')

if (process.argv[2]) {
  return copyTemplateFiles(process.argv[2])
}
Units.printCommandTips()

function copyTemplateFiles(path) {
  Units.mkdirsSync(`src/pages/${path}`)
  
  const COPY_FILES = fs.readdirSync(Path.resolve(Path.join(__dirname), 'template')).map(e => `DEMO/template/${e}`)
  COPY_FILES.forEach(ele => {
    let filePath = `src/pages/${path}/${Path.basename(ele)}`
    if (fs.existsSync(filePath)) {
      console.log('该文件已存在:' + filePath)
      return false
    }
    fs.writeFileSync(filePath, fs.readFileSync(ele));
  })
  console.log('文件创建在src/pages文件夹下')
  return true
}