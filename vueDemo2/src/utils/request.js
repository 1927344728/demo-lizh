import axios from 'axios'
import { isProduct } from './index'

const notLoggedInCode = -1

const baseURL = (() => {
  if (isProduct) {
    return `https://app.winbaoxian.com`  //线上环境接口地址
  } else if (location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
    return `//app.winbaoxian.cn`  //测试环境接口地址
  } else if (location.hostname.search(/pbf-uat\.winbaoxian\.cn/) !== -1) {
    return `//planbook-uat.winbaoxian.cn`  //数据测试环境接口地址
  } else if (location.hostname.search(/192\.168|localhost/) !== -1) {
    return `//app.winbaoxian.cn`  //开发环境接口地址
    return `//planbook-uat.winbaoxian.cn`  //开发环境接口地址
    return `//192.168.188.98:9600`  //开发环境接口地址
  }
})()

// 创建axios实例
const service = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000, // 请求超时时间
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// request拦截器
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 401 || res.status === 401 || (res.data && res.data.data === notLoggedInCode)) {
      return Promise.reject('login')
    }
    return res
  },
  error => {
    if (error.response && error.response.status == 401) {
      return Promise.reject('login')
    }
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
