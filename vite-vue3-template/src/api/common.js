import request from './request.js'

export function getCommonCurrentUser (params) {
  return request({
    isAllowErrorRequestReturn: true,
    url: '/planBook/common/currentUser',
    method: 'get',
    params
  })
}