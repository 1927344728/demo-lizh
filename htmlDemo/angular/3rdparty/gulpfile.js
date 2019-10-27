var gulp = require('gulp');
var del = require('del');
var mainBowerFiles = require('main-bower-files');
var bowerNormalizer = require('gulp-bower-normalize');

gulp.task('extract', function() {
    var stream;

    del(['dist/*', '!dist/overrides'], function() {
        stream = gulp.src(mainBowerFiles(), {
                base: 'bower_components'
            })
            .pipe(bowerNormalizer({
                bowerJson: 'bower.json'
            }))
            .pipe(gulp.dest('dist'));
    });
    return stream;
});

gulp.task('default', ['extract']);
