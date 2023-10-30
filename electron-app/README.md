## Electron

### 常见问题
### npm start，报错如下：
```shell
throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
```
**原因：** Electron 没有安装好。npm install 结束后，虽然 node_modules/electron/ 文件夹已存在， 但是 Electron 并没安装好（可能是墙的原因），导致文件缺失。从两点可以看出：一是，electron/dist 不存在或者没有可运行的文件；二是，node_modules/electron/ 下不存在 path.txt 文件。  
**解决方法：** 
* 手动[下载](https://npm.taobao.org/mirrors/electron/) Electron 压缩包， 如：https://registry.npmmirror.com/binary.html?path=electron/26.1.0/electron-v26.1.0-darwin-x64.zip。
* 解压压缩包，将解压后的文件复制到 node_modules/electron/dist 下。
* 在 node_modules/electron/ 下创建 path.txt 文件，文件中输入：Electron.app/Contents/MacOS/Electron。path.txt 的内容，不同平台不一样，可参考 node_modules/electron/install.js -> getPlatformPath 方法下的枚举值。
* 再执行 npm start。
备注：Mac 下，可能被拦截。可通过 系统偏好设置 -> 安全性与隐私 -> 左下角 '锁' 的 icon，解锁，允许第三方应用。
备注：另一种解决方案，查看 https://github.com/pangxieju/electron-fix。