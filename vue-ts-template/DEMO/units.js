var fs = require("fs")
var path = require("path")

function readDirSync(readPath, obj) {
  let menuList = obj || {}
  fs.readdirSync(readPath).forEach(function(ele, index) {
    let info = fs.statSync(readPath + "/" + ele)
    if (info.isDirectory()) {
      menuList[ele] = {}
      readDirSync(readPath + "/" + ele, menuList[ele]);
    } else {
      menuList[path.basename(ele, path.extname(ele))] = ''
    }
  })
  return menuList
}

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true
  }
  if (mkdirsSync(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true
  }
}

function deleteDirectory(url) {
  if (!fs.existsSync(url)) {
    console.log("给定的路径不存在，请给出正确的路径:" + url);
    return false
  }
  let files = fs.readdirSync(url) || [];
  files.forEach(file => {
    let curPath = path.join(url, file);
    if (fs.statSync(curPath).isDirectory()) {
      deleteDirectory(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(url);
  console.log('文件夹已删除:' + url)
}

function printCommandTips() {
  console.log('\n>>>>>>>>>>>>>>>>>>>>>>')
  console.log('请输入正确命令:')
  console.log('创建项目:' + 'npm run create [页面名称|路径]。如: `npm run create [filename]` 或者 `npm run create [directory/filename]`')
  console.log('删除项目:' + 'npm run delete [页面名称|路径]。如: `npm run delete [filename]` 或者 `npm run delete [directory/filename]`')
  console.log('启动项目可用npm run serve')
  console.log('>>>>>>>>>>>>>>>>>>>>>>\n')
}

module.exports = {
  readDirSync,
  mkdirsSync,
  deleteDirectory,
  printCommandTips
}