var apiBasePath = 'pbf.winbaoxian.cn'.search(/pbf\.winbaoxian\.com/) !== -1 ? "//app.winbaoxian.com" : "//app.winbaoxian.cn";
function helloWorld() {
    return 'hello world!' + apiBasePath
}
console.log(helloWorld())
