var express = require('express')
var app = express()
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5000")
    res.header("Access-Control-Allow-Credentials", true)
    next()
})
app.param('user', (req, res, next, id) => {
    console.log('param', req.params.user)
    next()
})
app.get('/user/:name', (req, res) => {
    res.end("Hello, " + req.params.name + ".")
})

app.get('/', (req,res) => {
    res.send('hello,world.')
})
var server = app.listen(3000, () => {
    var host = server.address().address
    var port = server.address().port
    console.log(server.address())
    console.log("访问地址为 http://localhost:%s", port)
})