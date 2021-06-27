import request from './request'

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
