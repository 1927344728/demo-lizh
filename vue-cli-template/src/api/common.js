import request from './request'
import {
  APP_API_DOMAIN
} from '@/utils/variables.js'

/**Í
 * 获取APP用户信息
 * @param {*} params 
 */
export function getCommonCurrentUser (params) {
  return request({
    baseURL: APP_API_DOMAIN,
    url: '/planBook/common/currentUser',
    params
  })
}