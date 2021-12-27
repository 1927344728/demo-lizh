const app = require('express')()
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })
wss.on('connection', (ws) => {
  console.log('连接成功！')
  ws.on('message', (message) => {
    console.log('客户端信息：', message)
    ws.send('Hello, I am WebSocket!')
  })
  setInterval(() => {
    ws.send('This time is ' + new Date().getTime())
  }, 1000)
})

app.get('/', (req, res) => {
  res.sendfile(__dirname + '/index.html')
})
app.listen(3000)