export const isProduct = location.hostname.search(/\.winbaoxian\.com/) !== -1

let baseApiPath1
if (location.hostname.search(/pbf\.winbaoxian\.com/) !== -1) {
  //线上环境接口地址
  baseApiPath1 = 'https://app.winbaoxian.com'
} else if (location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
  //测试环境接口地址
  baseApiPath1 = '//app.winbaoxian.cn'
} else if (location.hostname.search(/pbf-uat\.winbaoxian\.cn/) !== -1) {
  //数据测试环境接口地址
  baseApiPath1 = '//planbook-uat.winbaoxian.cn'
} else if (location.hostname.search(/192\.168|localhost/) !== -1) {
  baseApiPath1 = "//app.winbaoxian.cn"  //开发环境接口地址
  // baseApiPath1 = `${location.protocol}//192.168.188.98:9600`
  // baseApiPath1 = "//planbook-uat.winbaoxian.cn"  //开发环境接口地址
}
export const baseApiPath = baseApiPath1


//计划书ID
export const planbookId = getUrlParam('planbookId') * 1
//计划书类型。insPolicy1: 保单整理
export const pBType = getUrlParam('pbType')
//家庭保单的id
export const crmId = getUrlParam('cId')
//预览。1, 管理后台预览
export const isPreview = getUrlParam('preview')

//结果页的uuid
export const resultUuid = getUrlParam('uuid')
//收藏方案的id
export const schemeUuid = getUrlParam('schemeUuid')
//缓存中的uuid
let storageUuid2 = null
if (!pBType && isPreview != 1 && localStorage.getItem('intellectScheme')) {
    let storageUuid2 = JSON.parse(localStorage.getItem('intellectScheme'))['s' + planbookId]
}
export const storageUuid = storageUuid2


export const allApiUrl = {  //请求接口的地址
    initInputDataApi: `${baseApiPath}/planBook/V2/getInitData`,  //获取初始化数据
    calculateDataApi: `${baseApiPath}/planBook/V2/calculate`,   //计算接口
    queryAdvertApi: `${baseApiPath}/planBook/queryAdvert`,  //获取广告拉接口
    createPlanbookApi: `${baseApiPath}/planBook/V2/uploadResult`,   //生成计划书接口

    getComparePlanbookApi: `${baseApiPath}/planBook/compare/listPrepareList`, //获取可对比计划书列表
    verifyComparePlanbookApi: `${baseApiPath}/planBook/compare/verifyPrepareInsureType`, //按关键字搜索可对比计划书
    getAddAndTake: `${baseApiPath}/planBook/V2/addAndTake/`, //添加追加领取
    getCompareInitData: `${baseApiPath}/planBook/compare/getInitData`, //获取可对比计划书列表
    calCompareData: `${baseApiPath}/planBook/compare/calculate`, //获取可对比计划书列表
    sendInnerMail: `${baseApiPath}/planBook/V2/sendInnerMail`, //站内信发送请求
}

export function getTimeStr (time) {
  const second = Math.round((new Date() - time) / 1000)
  if (second < 60) {
    return `${second}秒前`
  } else if (second >= 60 && second < 60 * 60) {
    return `${Math.round(second / 60)}分钟前`
  } else if (second >= 60 * 60 && second < 60 * 60 * 24) {
    return `${Math.round(second / 60 / 60)}小时前`
  } else if (second >= 60 * 60 * 24 && second < 60 * 60 * 24 * 30) {
    return `${Math.round(second / 60 / 60 / 24)}天前`
  }
}

export function getUrlParam(name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url ? url : location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export default {
  isProduct,
  baseApiPath,

  planbookId,
  pBType,
  crmId,
  isPreview,
  resultUuid,
  schemeUuid,
  storageUuid,

  allApiUrl,

  getTimeStr,
  getUrlParam
}
