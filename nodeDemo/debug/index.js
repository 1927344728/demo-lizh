const fs = require('fs')
const fileSteam = fs.readFileSync('./nodeDemo/debug/test.txt')

let fileTx = fileSteam.toString()
let replaceTx = '古城夜韵22'
fileTx.replace('古城夜韵', replaceTx)
debugger
fs.writeFile('./nodeDemo/debug/test2.txt', fileTx,  function(err) {
   if (err) {
       return console.error(err);
   }
   console.log("数据写入成功！");
});
console.log(fileTx)