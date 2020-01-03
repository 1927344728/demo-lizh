//引入gulp
var gulp=require("gulp");


//引入各种插件
var jshint  = require("gulp-jshint");
var sass    = require("gulp-sass");
var concat  = require("gulp-concat");
var uglify  = require("gulp-uglify");
var rename  = require("gulp-rename");
var less    = require("gulp-less");
var autofx  = require("gulp-autoprefixer");
var cssmin  = require("gulp-minify-css");
var imgmin  = require("gulp-imagemin");
var pngmin  = require("imagemin-pngquant");
var clean   = require("gulp-clean");
var append  = require("gulp-rev-append");
var htmlmin = require("gulp-minify-html");
var handlebars  = require("gulp-handlebars");
var declare = require("gulp-declare");
var wrap    = require('gulp-wrap');
var browserSync = require('browser-sync').create();



//handlebars
gulp.task("handle", function(){
	gulp.src("hbs/*.hbs")
		.pipe(handlebars())
	    .pipe(wrap('Handlebars.template(<%= contents %>)'))
	    .pipe(declare({
	    	namespace: "my.test",
	    	noRedeclare: true
	    }))
	    .pipe(concat("handleTest1.js"))
	    .pipe(gulp.dest("dist"))
})


//js验证
gulp.task("jshint", function(){
	gulp.src("js/*.js")
	.pipe(jshint())
	.pipe(jshint.reporter("default"));
})


//合并，压缩js文件
gulp.task("min", function(){
	gulp.src(["js/*.js"])
		.pipe(concat("all.js"))
		.pipe(gulp.dest("dist"))
		.pipe(rename("all.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("dist"));
});


//压缩css文件
gulp.task("cssmin", function(){
	gulp.src("css/*.css")
		.pipe(cssmin())
		.pipe(gulp.dest("css"));
})


//压缩html文件
gulp.task("htmlmin", function(){
	gulp.src("html/*.html")
		.pipe(htmlmin())
		.pipe(gulp.dest("minHTML"));
})


//编译sass
gulp.task("sass", function(){
	gulp.src("css/*.scss")
		.pipe(sass())
		.pipe(gulp.dest("css"));
});


//编译less
gulp.task("less", function(){
	gulp.src("css/*.less")
		.pipe(less())
		.pipe(gulp.dest("css"));
});


//自动加前缀
gulp.task("autofx", function(){
	gulp.src("css/*.css")
	.pipe(autofx({
		browsers: ["last 2 versions"],
		 cascade: true
	}))
	.pipe(gulp.dest("css"))
})


//图片压缩
gulp.task("imgmin", function(){
	return gulp.src("images/*")
	    .pipe(imgmin({
            optimizationLevel: 7,  //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true,     //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true,      //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true,       //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{removeViewBox: false}],   //不要移除svg的viewbox属性
            use: [pngmin()]      //使用pngquant深度压缩png图片的imagemin插件
	    }))
	    .pipe(gulp.dest("min-images"));
})


gulp.task('testImagemin', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
});


//清理文件
// gulp.task("clean", function(){
// 	gulp.src("")
// 		.pipe(clean());
// })


//自动加版本号
gulp.task("append", function(){
	gulp.src("html/*.html")
		.pipe(append())
		.pipe(gulp.dest("html"));
})


//默认任务
gulp.task("default", function(){
	gulp.run("less","handle");
	browserSync.init({
	    server: {
	        baseDir: "./"
	    }
	});
	gulp.watch("css/*.less", ["less"]);
	gulp.watch("hbs/*.hbs", ["handle"]);
});


//默认任务
gulp.task("build", function(){
	gulp.run("less","handle");
});