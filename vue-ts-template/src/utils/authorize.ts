import { checkUserInfoExists, weixinUserinfo } from '@/api/index'
import {
  IS_PRODUCT
} from '@/utils/variables'
import { setUrlParams } from '@/utils'
import Guid from 'guid'

const bApp = window.appBridge.isApp()
const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
const appid = IS_PRODUCT ? 'wxbbbc0282a87ff36b' : 'wx7eb095d6d27a8cee'
const boxUrl = IS_PRODUCT ? 'https://wx.winbaoxian.com' : 'https://wx.winbaoxian.cn'
const redirectUrl = `${boxUrl}/box/wx/authorizeUserInfoWithCode?return_url=RETURN_URL`
const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=REDIRECT_URL&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`

export function getToken () : string | null {
  let token = localStorage.getItem('WeiyiStat_pb_token_openid')
  if (!token) {
    token = Guid.create().value
    localStorage.setItem('WeiyiStat_pb_token_openid', token || '')
  }
  return token
}

export function oCheckUserInfoExists () : any {
  if (bApp || !inWechat) {
    return Promise.reject('请在微信下打开')
  }
  return checkUserInfoExists({
    token: getToken(),
    appId: appid
  }).then((res : any) => {
    if (res.code === 400) {
      // 未授权
      return oWeixinAuthorize()
    } else {
      // 已授权
      return Promise.resolve({
        token: getToken(),
        appId: appid
      })
    }
  })
}
export function oWeixinAuthorize () : any {
  const _return_url = setUrlParams(
    {
      token: getToken(),
      wxMpAppid: appid
    },
    location.href
  )
  const goOauthUrl = authUrl.replace(
    /REDIRECT_URL/,
    encodeURIComponent(
      redirectUrl.replace(/RETURN_URL/, encodeURIComponent(_return_url))
    )
  )
  location.href = goOauthUrl
  return Promise.reject()
}

export function oWeixinUserinfo () : any {
  return weixinUserinfo({
    token: getToken(),
    appid
  }).then((res : any) => {
    if (res.success && res.extObject) {
      return Promise.resolve(res.extObject)
    } else {
      return Promise.reject(res)
    }
  })
}
