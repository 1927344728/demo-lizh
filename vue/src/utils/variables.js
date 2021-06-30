import QS from 'qs'
export function getUrlParam (name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url ? url : location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let _baseApiPath = ''
if (location.hostname.search(/pbf\.winbaoxian\.com/) !== -1) {
    _baseApiPath = 'https://app.winbaoxian.com'
} else if (location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
    _baseApiPath = '//app.winbaoxian.cn'
} else if (location.hostname.search(/192\.168|localhost/) !== -1) {
    _baseApiPath = "//app.winbaoxian.cn"
}
export const BASE_API_PATH = _baseApiPath

export const PLANBOOK_ID = getUrlParam('planbookId')
export const PB_TYPE = getUrlParam('pbType')
export const CRM_ID = getUrlParam('cId')
export const PREVIEW = getUrlParam('preview')  //纯预览。1：不导入缓存数据

let _storageUuid = null
if (PREVIEW != 1 && localStorage.getItem('intellectScheme')) {
    _storageUuid = JSON.parse(localStorage.getItem('intellectScheme'))['s' + PLANBOOK_ID]
}
export const STORAGE_UUID = _storageUuid
export const RESULT_UUID = getUrlParam('uuid') //结果页uuid
export const SCHEME_UUID = getUrlParam('schemeUuid') //方案uuid

let _URL_PARAM = {}
let searchStr = location.search ? location.search.substr(1) : ''
if (searchStr) {
  _URL_PARAM = QS.parse(searchStr)
}
_URL_PARAM.isMiniprogram = false
if (window.Jax && Jax.isApp()) {
} else {
  // setTimeout(() => {
  //   _URL_PARAM.isMiniprogram = true
  // }, true)
  window.wx && wx.miniProgram.getEnv(res => {
    _URL_PARAM.isMiniprogram = res.miniprogram
  })
}
export const URL_PARAM = _URL_PARAM

export const IS_BXS_APP = window.Jax && Jax.isBxsApp()
export const IS_BROKER_APP = window.Jax && Jax.isBrokerApp()
export const IS_JYY_APP = window.Jax && Jax.isYjjApp()

