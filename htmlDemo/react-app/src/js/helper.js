function getQueryString (name) {
     let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     let r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

function judgeEnv () {
    let baseApiPath  //接口基本地址
    if (window.location.hostname.search(/pbf\.winbaoxian\.com/) !== -1) {
        baseApiPath = 'https://app.winbaoxian.com'  //线上环境接口地址
    } else if (window.location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
        baseApiPath = '//app.winbaoxian.cn'  //测试环境接口地址
    } else if (window.location.hostname.search(/192\.168|localhost/) !== -1) {
        baseApiPath = "//app.winbaoxian.cn"  //开发环境接口地址
    }
    return baseApiPath
}

export default {
    getQueryString,
    judgeEnv
}