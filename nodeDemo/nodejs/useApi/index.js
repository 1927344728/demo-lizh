var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url')
var rm      = require('rimraf')
var webpack = require('webpack')
var qs = require('qs')
var request = require('request').defaults({
	jar: true
});

var co = require('co');
var OSS = require('ali-oss');


var server = new http.Server().listen(5500);
var baseApiPath


function getQueryString (apiURL, name) {
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = apiURL.match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}


server.on('request', function (req, response) {
	var reqUrl = url.parse(req.url);	// 解析请求的URL
	console.log(reqUrl)
	if (reqUrl.pathname === '/uploadVerifyFile') {
		baseApiPath = 'http://manage-planbook.winbaoxian.' + (req.headers.host.search('.winbaoxian.com') === -1 ?'cn' : 'com')
		getLoginCookies({
			id: getQueryString(reqUrl.query, 'id'),
			userName: getQueryString(reqUrl.query, 'userName'),
			password: getQueryString(reqUrl.query, 'password'),
			url: baseApiPath +'/api/security/auth'
		}, function (ok) {
			response.writeHead(200, {'Content-Type': 'text/plain; charset=UTF-8'});
			response.write(ok? 'upload, success' : 'no verify file');
			response.end();
		})
	}
});


function getLoginCookies (options, success) {  //登录管理后台
	console.log('登录：', options)
	request.post(options.url, {
		form: {
			"userName": options.userName,
			"password": options.password
		}
	}, function (e, res, body) {
	    if (e) {
	    	console.log(e)
	    } else {
	    	requestFilesName({
	    		planbookId: options.id
	    	}, success)
	    }
	});
}

function requestFilesName (optionsGet, success) {  //请求计划书配置数据
	request.get(baseApiPath + '/api/automation/pbs/' + optionsGet.planbookId, function (e, res, body) {
	    if (e) {
	    	console.log(e)
	    } else {
	    	var resData = JSON.parse(body)
	    	var rulesArr = []
	    	var entryArr = []
	    	if (resData.success && resData.data) {
		    	var inputData = resData.data.inputData;  //计划书配置数据

		    	if (fs.existsSync('./js/rules/pbRule/pbRule' + optionsGet.planbookId + '.js')) {  //计划书对应验证方法
		    		entryArr.push('./js/rules/pbRule/pbRule' + optionsGet.planbookId + '.js')
		    	}

		    	inputData.productGroupList.map(function (group) {
		    		group && group.prodOrderList.map(function (prod) {
		    			if (fs.existsSync('./js/rules/prodRules/prodRule' + prod.key + '.js')) {	//产品对应验证方法
		    				entryArr.push('./js/rules/prodRules/prodRule' + prod.key + '.js')
		    			}
		    			prod && prod.mulInsOrderList.map(function (ins) {
		    				if (rulesArr.indexOf(ins.key) === -1 && fs.existsSync('./js/rules/insRules/insRule' + ins.key + '.js')) {
		    					rulesArr.push(ins.key)
		    					entryArr.push('./js/rules/insRules/insRule' + ins.key + '.js')
		    				}
		    			})
		    		})
		    	})

				console.log('验证js数组:', entryArr)
				var webpackConfig  = {
					entry: entryArr,
					output: {
						path: __dirname + '/dist/planbookVerify',
						filename: 'verifyRules' + optionsGet.planbookId + '.js',
						publicPath: './dist/planbookVerify'
					},
					resolve: {
						extensions: ['.js', '.json'],
					},
					module: {
						rules: [
							{
								test: /\.js$/,
								loader: 'babel-loader',
							},
						]
					}
				}
				packageJsFiles(webpackConfig, success)  //打包js
	    	} else {
	    		console.log('计划书数据请求失败')
	    	}
	    }
	});
}


function packageJsFiles(webpackConfig, success) {	//将所有验证方法的js打包
	var filePath = webpackConfig.output.publicPath + '/' + webpackConfig.output.filename
	if (webpackConfig.entry.length) {
		rm(filePath, err => {  //删险原文件
			if (err) throw err

			webpack(webpackConfig, function (errs, stats) {
				if (errs) throw errs
				process.stdout.write(stats.toString({
					colors: true,
					modules: false,
					children: false,
					chunks: false,
					chunkModules: false
				}) + '\n\n')
				uploadToOss(filePath, success) //将文件上传到oss
			})
		})
	} else {
		success && success(false)
		console.log('没有验证js文件\n\n\n')
	}
}

function uploadToOss (filePath, success) { //将文件上传到oss
	var client = new OSS({  //oss服务
	  region: 'oss-cn-hangzhou',
	  accessKeyId: 'qLoegog4QVKbscAd',
	  accessKeySecret: 'Ut2WrkZX1t1PMd9bWee8bGJzyQkGfw',
	  bucket: 'wyres'
	});
	//上传本地文件
	co(function* () {
		console.log('filePath', filePath)
		var filename = path.parse(filePath).base
		var remotePath = '//res.winbaoxian.com/planbookVerify/'
		var result = yield client.put('planbookVerify/' + filename, filePath);
		console.log("url:", remotePath + filename )

		success && success(true)
		request.post('http://service.winbaoxian.cn/aliyun/cdnrefresh', {form: {path: 'http:' + remotePath + filename}}, (e, res, body) => {  //清除缓存
			if(e){
				console.log('清缓存出错：', e)
			}else{
				console.log('已清缓存：', body)
				console.log('\n\n\n')
			}
		})
	}).catch(function (err) {
		console.log(err);
	});
}





