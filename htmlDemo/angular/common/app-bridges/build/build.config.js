'use strict';

//basic configuration object used by gulp tasks
module.exports = {
    port: 4000,
    uiPort: 4001,
    ghostMode: false,
    tmp: 'build/tmp',
    dist: 'build/dist',
    src: 'src',
    tpl: 'test/tpls/*.hbs',
    tplNameSpace: 'TPLS',
    js: [
        'src/*.js',
        'test/*.js',
        '!src/vendor/**/*.js'
    ],
    css: 'test/*.css',
    index: [
        'test/*.html'
    ],
    banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''
    ].join('\n')
};
