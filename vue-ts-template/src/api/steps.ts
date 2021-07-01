import request from './request'

export function getQaList () : any {
  return request({
    url: '/sales/qa/list'
  })
}

export function getQaObjectionList () : any {
  return request({
    url: '/sales/qa/objection/list'
  })
}

export function getTemplateDetail (params : unknown) : any {
  return request({
    url: '/sales/qa/template/detail',
    params
  })
}

export function getQaDetail (params : unknown) : any {
  return request({
    url: '/sales/qa/detail',
    params
  })
}

export function sendQaTemplate (params : unknown) : any {
  return request({
    url: '/sales/qa/sendTemplate',
    method: 'post',
    data: params
  })
}

export function sendQaFromTrack (params : unknown) : any {
  return request({
    url: '/sales/qa/send',
    method: 'post',
    data: params
  })
}

export function createQaStep (params : unknown) : any {
  return request({
    url: '/sales/qa/createStep',
    method: 'post',
    data: params
  })
}

export function getWxQaDetail (params : unknown) : any {
  return request({
    url: '/wx/sales/qa/detail',
    params
  })
}

export function feedbackSalesQa (params : {
  appId: string,
  token: string
}) : any {
  return request({
    url: `/wx/sales/qa/feedback?appId=${params.appId}&token=${params.token}`,
    method: 'post',
    data: params
  })
}

export function getQaTrace (params : unknown) : any {
  return request({
    url: '/sales/qa/trace',
    params
  })
}

export function unbindQaPlanbook (params : unknown) : any {
  return request({
    url: '/sales/qa/planbookUnbind',
    method: 'post',
    data: params
  })
}
