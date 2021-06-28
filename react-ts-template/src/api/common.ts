import request from './request'
import {
  APP_API_DOMAIN
} from '@/utils'

export function getCommonCurrentUser (params : unknown) : any {
  return request({
    baseURL: APP_API_DOMAIN,
    url: '/planBook/common/currentUser',
    method: 'get',
    params
  })
}

export function getSalesQaList (params : unknown) : any {
  return request({
    url: '/sales/qa/list',
    method: 'get',
    params
  })
}

export function getSalesQaObjectionList (params : unknown) : any {
  return request({
    url: '/sales/qa/objection/list',
    method: 'get',
    params
  })
}
export function getSalesQaTracePage (params : unknown) : any {
  return request({
    url: '/sales/qa/trace',
    method: 'get',
    params
  })
}
