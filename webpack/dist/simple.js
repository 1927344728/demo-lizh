
      (function(modules) {
        function require(fileName) {
          const fn = modules[fileName];
          const module = { exports : {} };
          fn(require, module, module.exports);
          return module.exports;
        }
        require('./simple.js');
        console.log('Sat Nov 05 2022 13:34:49 GMT+0800 (China Standard Time)');
        console.log('This is myWebpack!');
      })({
        './simple.js': function (require, module, exports) { "use strict";

require("./assets/js/a.js");

console.log('done'); },
      
        './assets/js/a.js': function (require, module, exports) { "use strict";

console.log('a'); },
      })