const Units = require('./units.js')

if (process.argv[2]) {
  Units.deleteDirectory('src/pages/' + process.argv[2])
  return false
}
Units.nodeRunWarning()