import { isAfterIphoneX } from './env'
import { getUrlParams } from './url'

export const IS_PRODUCT = window.location.hostname.search(/\.winbaoxian\.com/) !== -1
export const IS_LOCALHOST = window.location.hostname.search(/localhost|192\.168|172\.0\.0\.1/) !== -1

let _BASE_API_PATH = ''
if (window.location.hostname.search(/\.winbaoxian\.com/) !== -1) {
  _BASE_API_PATH = 'https://content.winbaoxian.com'
} else if (window.location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
  _BASE_API_PATH = 'https://content.winbaoxian.cn'
} else if (window.location.hostname.search(/192\.168|localhost/) !== -1) {
  _BASE_API_PATH = 'https://content.winbaoxian.cn'
}
export const APP_API_DOMAIN = `https://app.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}`
export const CONTENT_API_DOMAIN = _BASE_API_PATH
export const WX_API_DOMAIN = `https://wx.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}`

export const URL_PARAM : any = getUrlParams()
export const SAFE_AREA_INSET_BOTTOM : any = isAfterIphoneX() ? 34 : 0