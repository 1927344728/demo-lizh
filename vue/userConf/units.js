var fs = require("fs")
var path = require("path")
var root = path.join(__dirname)


function readDirSync(readPath, obj) { //遍历当前文件夹，返回一个对象
  var menuList = obj || {}
  fs.readdirSync(readPath).forEach(function(ele, index) {
    var info = fs.statSync(readPath + "/" + ele)
    if (info.isDirectory()) {
      menuList[ele] = {}
      readDirSync(readPath + "/" + ele, menuList[ele]);
    } else {
      menuList[path.basename(ele, path.extname(ele))] = ''
    }
  })
  return menuList
}

function mkdirsSync(dirname) { //递归创建目录 同步方法
  if (fs.existsSync(dirname)) {
    // console.log('该文件夹已存在:' + dirname)
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

function deleteDirectory(url) { //删除指定文件夹及其子目录和文件。不删除父目录
  var files = [];
  if (fs.existsSync(url)) {
    //返回文件和子目录的数组
    files = fs.readdirSync(url);
    files.forEach(function(file, index) {
      var curPath = path.join(url, file);
      if (fs.statSync(curPath).isDirectory()) { //判断是否为文件夹
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    //清除文件夹
    fs.rmdirSync(url);
    console.log('文件夹已删除:' + url)
  } else {
    console.log("给定的路径不存在，请给出正确的路径:" + url);
  }
}

function copyTemplate() {
  console.log('\n请输入正确命令:')
  console.log('创建项目:' + 'npm run create [项目名|路径]。如: `npm run create planbookInfo`')
  console.log('删除项目:' + 'npm run delete [项目名|路径]。如: `npm run delete planbookInfo`')
  console.log('启动项目可用npm run serve')
  console.log('>>>>>>>>>>>>>>>>>>>>>>\n')
}


module.exports = {
  readDirSync,
  mkdirsSync,
  deleteDirectory
}