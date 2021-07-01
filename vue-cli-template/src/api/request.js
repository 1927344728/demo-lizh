import Vue from 'vue';
import axios from 'axios'
import {
  gotoLogin,
  BASE_API_PATH
} from '@/utils/index.js'
import { Toast } from 'bxs-ui-vue'
Vue.use(Toast)

// 创建axios实例
let options = {
  baseURL: BASE_API_PATH,
  withCredentials: true,
  timeout: 10000, // 请求超时时间
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

const service = axios.create(options)

let loadingTimer = null
const loading = show => {
  if (window.appBridge && appBridge.showLoading) {
    if (show) {
      appBridge.showLoading()
    } else {
      appBridge.hideLoading()
    }
  }
}

// request拦截器
service.interceptors.request.use(
  config => {
    if (loadingTimer) clearTimeout(loadingTimer)
    loadingTimer = setTimeout(() => {
      loading(true)
    }, 300)
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
    if (loadingTimer) clearTimeout(loadingTimer)
    loading(false)
    const res = response.data
    if (res.code === 401 || res.status === 401) {
      gotoLogin()
      return Promise.reject('login')
    }
    return res
  },
  error => {
    if (loadingTimer) clearTimeout(loadingTimer)
    loading(false)
    if (error.response && error.response.status == 401) {
      gotoLogin()
      return Promise.reject('login')
    }
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
