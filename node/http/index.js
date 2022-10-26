const http = require('http')
const url = require('url')

const hostname = '0.0.0.0'
const port = 3000
const server = http.createServer((message, res) => {
  res.statusCode = 200
  res.statusMessage = 'OKkk'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
})
server.on('request', (message, res) => {
  const urlObj = url.parse(message.url)
  const searchParamsObj = new url.URLSearchParams(urlObj.query)
  res.write(searchParamsObj.get('name') || 'Lizhao01!')
  res.end()
})
server.listen(port, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`)
})