import request from './request'
import {
  APP_API_DOMAIN
} from '@/utils/variables'

export function getCommonCurrentUser (params? : any) : any {
  return request({
    baseURL: APP_API_DOMAIN,
    url: '/planBook/common/currentUser',
    params
  })
}
