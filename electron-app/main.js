const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // 通过预加载脚本从渲染器访问Node.js
    // 预加载脚本在渲染器进程加载之前加载，并有权访问两个 渲染器全局 (例如 window 和 document) 和 Node.js 环境
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.webContents.openDevTools()
  win.loadFile('index.html')
}
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()

  // 如果没有任何浏览器窗口是打开的，则调用 createWindow() 方法
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 关闭所有窗口时退出应用
// 如果用户不是在 macOS(darwin) 上运行程序，则调用 app.quit()
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
