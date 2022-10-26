// const readline = require('readline');
// const readlineInst = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// readlineInst.question('请输入些什么吧？', (answer) => {
//   console.log(`输入：${answer}`);
//   readlineInst.close();
// });

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('nodejs/test.txt'),
  crlfDelay: Infinity
});
rl.on('line', (line) => {
  console.log(`单行：${line}`);
});