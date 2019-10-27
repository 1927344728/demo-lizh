var express = require('express');
var app = express();

// app.param('user', function(req, res, next, id){
//     console.log('param', req.params.user)
//     next()
// });
// app.get('/name/:user', function(req, res) {
//     res.end("Hello, " + req.params.user + ".");
// })

app.get('/',function(req,res){
    res.send('hello,world');
});
debugger
var server = app.listen(8089, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})