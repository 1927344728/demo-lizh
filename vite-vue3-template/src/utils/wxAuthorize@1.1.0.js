/**
 * version: 1.1.0
 * Author: Lizhao
 * 描述：微信授权的封装
 * 升级：与上一版对比，更换了授权 API 域名和公众号 appid。
 */
import axios from 'axios';
import QS from 'qs'
import { IS_PRODUCT_ENV, URL_PARAM } from '@/utils/variables.js'
import Guid from 'guid'

export const WX_HOSTNAME = `https://wx.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}`
// 管家公众号：wxbbbc0282a87ff36b
// 管家测试公众号：wx7eb095d6d27a8cee
export const appid = IS_PRODUCT_ENV ? 'wxbbbc0282a87ff36b' : 'wx7eb095d6d27a8cee'
export function getToken() {
  let token = localStorage.getItem('WeiyiStat_pb_token_openid')
  if (!token) {
    token = Guid.create().value
    localStorage.setItem('WeiyiStat_pb_token_openid', token)
  }
  return token
}

export function oCheckUserInfoExists() {
  const isWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
  if (!isWechat) {
    return Promise.reject('请在微信下打开')
  }
  return axios.get(`${WX_HOSTNAME}/box/wx/checkUserInfoExists`, {
    params: {
      token: getToken(),
      appId: appid
    }
  }).then(({ data }) => {
    const { code } = data
    // 未授权
    if (code === 400) {
      return oWeixinAuthorize()
    } 
    // 已授权
    return Promise.resolve({
      token: getToken(),
      appId: appid
    })
  })
}
export function oWeixinAuthorize() {
  const returnUrl = `${location.origin}${location.pathname}?` + QS.stringify({
    ...(URL_PARAM || {}),
    token: getToken(),
    wxMpAppid: appid
  })
  const redirectUrl = `${WX_HOSTNAME}/box/wx/authorizeUserInfoWithCode?return_url=${encodeURIComponent(returnUrl)}`
  const authorizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
  console.log(authorizeUrl)
  location.href = authorizeUrl
}

export function oWeixinUserinfo() {
  return axios.get(`${WX_HOSTNAME}/wechat/cache/userinfo/get`, {
    params: {
      token: getToken(),
      appid
    }
  }).then(({ data }) => {
    const { success, extObject } = data
    if (success && extObject) {
      return Promise.resolve(extObject)
    }
    return Promise.reject(res)
  })
}
