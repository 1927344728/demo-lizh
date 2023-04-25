import QS from 'qs'
import { isAfterIphoneX } from './env.js'

export const IS_PRODUCT_ENV = !!location.hostname.match(/\.com$/)
export const IS_TEST_ENV = !!location.hostname.match(/\.cn$/)
export const IS_LOCALHOST_ENV = !!location.hostname.match(/localhost|192\.168|127\.0\.0\.1/)

export const APP_HOSTNAME = `https://app.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const CONTENT_HOSTNAME = `https://content.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
export const INTERACTION_HOSTNAME = `https://interaction-api.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`

export const APP_CHANNEL = getAppChannel()
export const SAFE_AREA_INSET_BOTTOM = isAfterIphoneX() ? 34 : 0
export const NATIVE_DOMAIN = getNativeDomain()
export const COMMON_PARAM = {
  APP_HOSTNAME,
  SAFE_AREA_INSET_BOTTOM
}
const searchStr = location.search ? location.search.substring(1) : ''
export const URL_PARAM = searchStr ? QS.parse(searchStr) : {}

function getAppChannel() {
  if (!window.Jax) {
    return null
  }
  if (Jax.isBxsApp()) {
    return 'BXS'
  }
  if (Jax.isBrokerApp()) {
    return 'BROKER'
  }
  if (Jax.isYjjApp()) {
    return 'YJJ'
  }
  if (Jax.isToBApp()) {
    return 'TOB'
  }
  // https://developers.weixin.qq.com/community/develop/doc/00022e37c78b802f186750b5751000
  if ((navigator.userAgent.match(/micromessenger/i) && navigator.userAgent.match(/miniprogram/i)) || window.__wxjs_environment === 'miniprogram') {
    return 'WXMP'
  }
  if (Jax.isWeCom && Jax.isWeCom()) {
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
  if (!window.appBridge) {
    return ''
  }
  const appType = appBridge.appType
  const appId = appBridge.appId
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

