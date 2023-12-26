import request from './request.js';
import { TOOL_API_HOSTNAME, CLIENT_HOSTNAME, WX_HOSTNAME } from '@/utils/variables.js'

export function getCurrentUser(params) {
  return request({
    url: '/planBook/common/currentUser',
    method: 'get',
    params,
  });
}

export function checkUserInfoExists(params) {
  return request({
    baseURL: WX_HOSTNAME,
    url: '/box/wx/checkUserInfoExists',
    method: 'get',
    params,
  });
}

export function weixinUserinfo(params) {
  return request({
    baseURL: WX_HOSTNAME,
    url: `/wechat/cache/userinfo/get`,
    method: 'get',
    params,
  });
}

export function getSimpleCurrentUser(params) {
  return request({
    baseURL: TOOL_API_HOSTNAME,
    url: '/common/getSimpleCurrentUser',
    params,
  });
}

export function getSimpleCurrentUser2C(params) {
  return request({
    baseURL: TOOL_API_HOSTNAME,
    url: '/common/getSimpleCurrentUser2C',
    params,
  });
}

export function wxClientSaveOperate(params) {
  return request({
    baseURL: CLIENT_HOSTNAME,
    url: '/wxClient/saveOperate',
    method: 'post',
    data: params,
  });
}
