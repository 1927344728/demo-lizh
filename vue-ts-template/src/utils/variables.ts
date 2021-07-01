import { isAfterIphoneX } from './env'
import { getUrlParams } from './url'

export const IS_PRODUCT = location.hostname.search(/\.winbaoxian\.com/) !== -1
export const IS_LOCALHOST = location.hostname.search(/localhost|192\.168|172\.0\.0\.1/) !== -1

let _BASE_API_PATH = ''
if (location.hostname.search(/\.winbaoxian\.com/) !== -1) {
  _BASE_API_PATH = 'https://content.winbaoxian.com'
} else if (location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
  _BASE_API_PATH = '//content.winbaoxian.cn'
} else if (location.hostname.search(/192\.168|localhost/) !== -1) {
  _BASE_API_PATH = '//content.winbaoxian.cn'
}
export const APP_API_DOMAIN = `https://app.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}`
export const CONTENT_API_DOMAIN = _BASE_API_PATH
export const WX_API_DOMAIN = `https://wx.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}`

export const URL_PARAM = getUrlParams()
export const SAFE_AREA_INSET_BOTTOM = isAfterIphoneX() ? 34 : 0
