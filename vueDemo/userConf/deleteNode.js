const Units = require('./units.js')

console.log(process.argv)
if (process.argv[2]) {
  Units.deleteDirectory('src/pages/' + process.argv[2])
} else {
  Units.nodeRunWarning()
}