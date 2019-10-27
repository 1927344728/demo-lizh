var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();

var filter = require('gulp-filter');

var pathCss = 'src/css/*.css',
	pathJsLib = 'src/js/lib/*.js',
	pathJsCommonLib = 'src/js-common-lib/*.js',
	pathJs = 'src/js/*.js',
	pathAssets = 'src/img/*.png';

gulp.task('scripts', function() {
	return gulp.src([pathJsLib, pathJs])
		.pipe(sourcemaps.init())
		.pipe(concat('js/zengxian-fixed.min.js'))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist-prod'));
});
gulp.task('pathJsCommonLib', function() {
	return gulp.src(pathJsCommonLib)
		.pipe(gulp.dest('dist-prod/js-common-lib/'));
})

gulp.task('styleSheets', function() {
	return gulp.src(pathCss)
		.pipe(gulp.dest('dist-prod/css/'));
});

gulp.task('scripts-watch', ['scripts'], function() {
	browserSync.reload();
});

gulp.task('index-watch', function() {
	browserSync.reload();
});

gulp.task('html-index', function() {
	return gulp.src("src/test-pop-miniable.html")
		.pipe(gulp.dest('dist-prod'));
});

// 启动本地调试服务器
gulp.task('serve', function() {
	browserSync.init({
		port: 3088,
		server: {
			baseDir: "../",
			index: "pop-miniable/gulp-index.html"
		}
	});
	gulp.watch(pathCss, function() {
		gulp.src(pathCss)
			.pipe(browserSync.stream());
	});
	gulp.watch([pathJs, pathJsLib], ['scripts-watch']);
	gulp.watch('src/test-pop-miniable.html', ['index-watch']);
});

gulp.task('dist-prod-watch', ['dist-prod'], function() {
	browserSync.reload();
});

//复制图片等文件。
gulp.task('assets', function() {
	return gulp.src(pathAssets)
		.pipe(gulp.dest('dist-prod/img'));
});

gulp.task('build', ['scripts']);
gulp.task('dist', ['build', 'pathJsCommonLib', 'styleSheets', 'assets', 'html-index']);
gulp.task('dist-prod', ['dist']);
gulp.task('git', ['dist-prod']);
gulp.task('default', ['serve']);