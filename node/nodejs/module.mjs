import { createRequire } from 'module';
const myRequire = createRequire(import.meta.url);
const objC = myRequire('./c.js')
console.log(import.meta)
debugger