import request from './request'
import {
  WX_API_DOMAIN
} from '@/utils/variables'

export function checkUserInfoExists(params : unknown) : any {
  return request({
    baseURL: WX_API_DOMAIN,
    url: '/box/wx/checkUserInfoExists',
    method: 'get',
    params,
  });
}

export function weixinUserinfo(params: unknown) : any {
  return request({
    baseURL: WX_API_DOMAIN,
    url: `/wechat/cache/userinfo/get`,
    method: 'get',
    params,
  });
}