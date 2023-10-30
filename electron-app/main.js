const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
console.log('Hellow World!')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
  ipcMain.handle('load-file', (event, url) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win.loadFile(url)
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})