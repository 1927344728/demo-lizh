import request from './request'
import {
  BOX_API_DOMAIN,
  WX_DOMAIN
} from '@/utils/variables.js'

/**
 * 判断微信是否绑定
 * @param {*} params 
 */
export function checkUserInfoExists(params) {
  return request({
    baseURL: BOX_API_DOMAIN,
    url: '/box/wx/checkUserInfoExists',
    method: 'get',
    params,
  });
}

/**
 * 获取微信用户信息
 * @param {*} params 
 */
export function weixinUserinfo(params) {
  return request({
    baseURL: WX_DOMAIN,
    url: `/wechat/cache/userinfo/get`,
    method: 'get',
    params,
  });
}