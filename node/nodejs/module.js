const { createRequire } = require('module');
const myRequire = createRequire(__filename);
const objC = myRequire('./c.js');
console.log(objC)
debugger