import QS from 'qs'

export const IS_PRODUCT_ENV = location.hostname.search(/pbf\.winbaoxian\.com/) !== -1
export const IS_TEST_ENV = location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1
export const IS_LOCALHOST_ENV = location.hostname.search(/localhost|192\.168|127\.0\.0\.1/) !== -1

export const APP_HOSTNAME = `https://app.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const CONTENT_HOSTNAME = `https://content.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const INTERACTION_HOSTNAME = `https://interaction-api.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const TOOL_API_HOSTNAME = `https://tool-api.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const CLIENT_HOSTNAME = `https://client.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const WX_HOSTNAME = `https://wx.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`

export const APP_CHANNEL = getAppChannel()

export const COMMON_PARAM = {
  APP_HOSTNAME,
  NATIVE_DOMAIN: getNativeDomain()
}
let _URL_PARAM = {}
const hash = location.hash
let searchStr = hash ? hash.split('?')[1] : ''
if (searchStr) {
  _URL_PARAM = QS.parse(searchStr)
}

export const URL_PARAM = _URL_PARAM

export const WX_GUANJIA_MP_ID = IS_PRODUCT_ENV ? 'wxbbbc0282a87ff36b' : 'wx7eb095d6d27a8cee';

function getAppChannel() {
  if (!window.Jax) {
    return null
  }
  if (window.Jax.isBxsApp()) {
    return 'BXS'
  }
  if (window.Jax.isBrokerApp()) {
    return 'BROKER'
  }
  if (window.Jax.isYjjApp()) {
    return 'YJJ'
  }
  if (window.Jax.isToBApp()) {
    return 'TOB'
  }
  // https://developers.weixin.qq.com/community/develop/doc/00022e37c78b802f186750b5751000
  if ((navigator.userAgent.match(/micromessenger/i) && navigator.userAgent.match(/miniprogram/i)) || window.__wxjs_environment === 'miniprogram') {
    return 'WXMP'
  }
  if (window.Jax.isWeCom && window.Jax.isWeCom()) {
    return 'WXWORK'
  }
  if (window.WeCom && window.WeCom.isWeEnterprise && window.WeCom.isWeEnterprise()) {
    return 'WXQYH'
  }
  if (window.appBridge && window.appBridge.isWechat()) {
    return 'WECHAT'
  }
  return 'H5'
}
function getNativeDomain() {
  const appType = window.appBridge && window.appBridge.appType
  const appId = window.appBridge && window.appBridge.appId
  // appType === 'BXS' 表示保险师App
  // appType === 'BROKER' 表示经纪人App
  // appType === 'YJJ' 表示易经经App（掌上职场）
  // appType === 'TOB' 表示TOB App

  switch (appType) {
    case 'YJJ':
      return `weiease://`
    case 'TOB':
      return `${appId}://`
    default:
      return `bxs://`
  }
}