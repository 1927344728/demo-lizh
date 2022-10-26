const fs = require('fs/promises');
(async function() {
  const data = await fs.readFile('./nodejs/test.txt', { encoding: 'utf8'})
  console.log(data)
})();