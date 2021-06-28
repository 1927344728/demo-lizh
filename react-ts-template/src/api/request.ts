import axios from 'axios'
import {
  CONTENT_API_DOMAIN
} from '@/utils/index'

const options = {
  baseURL: CONTENT_API_DOMAIN,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

const service = axios.create(options)
service.interceptors.request.use(
  (config : any) => {
    window.appBridge.showLoading()
    return config
  },
  (error: any) => {
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response : any) => {
    window.appBridge.hideLoading()
    const res = response.data
    if (res.code === 401 || res.status === 401) {
      return Promise.reject(new Error('login'))
    }
    return res
  },
  (error : any) => {
    window.appBridge.hideLoading()
    if (error.response && error.response.status === 401) {
      return Promise.reject(new Error('login'))
    }
    return Promise.reject(error)
  }
)

export default service
