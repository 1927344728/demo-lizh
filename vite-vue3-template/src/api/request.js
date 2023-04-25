import axios from 'axios'
import { gotoLogin } from '@/utils/index.js'
import { APP_HOSTNAME } from '@/utils/variables.js'
// import { Toast } from 'bxs-ui-vue/lib'

const options = {
  baseURL: APP_HOSTNAME,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
}

let loadingTimer = null
const loading = show => {
  clearTimeout(loadingTimer)
  if (window.appBridge && appBridge.showLoading) {
    appBridge[show ? 'showLoading' : 'hideLoading']()
  }
}

let requestConfig = null
const service = axios.create(options)
service.interceptors.request.use(
  config => {
    clearTimeout(loadingTimer)
    loadingTimer = setTimeout(() => {
      loading(true)
    }, 300)
    requestConfig = config
    return config
  },
  error => {
    Promise.reject(error)
  }
)
service.interceptors.response.use(
  response => {
    loading(false)
    const res = response.data
    const { success, code, status, data, info } = res
    // 兼容老接口：接口请求成功，data = -1 表示未登录
    if (code === 401 || status === 401 || (success && data === -1)) {
      gotoLogin()
      return res
    }
    if (requestConfig.isAllowErrorRequestReturn) {
      return res
    }
    if (!success) {
      // Toast(info)
      return
    }
    return data
  },
  error => {
    loading(false)
    if (error.response && error.response.status == 401) {
      gotoLogin()
    }
    return Promise.reject(error)
  }
)

export default service
