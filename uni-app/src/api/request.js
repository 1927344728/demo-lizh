import axios from 'axios';
import { gotoLogin } from '@/utils/index.js';
const NOT_LOGGED_IN_CODE = -1;

const BASE_API = (() => {
  var env;
  if (location.hostname.search(/pbf\.winbaoxian\.com/) !== -1) {
    // 线上环境接口地址
    env = 'https://app.winbaoxian.com';
  } else if (location.hostname.search(/pbf\.winbaoxian\.cn/) !== -1) {
    // 测试环境接口地址
    env = 'https://app.winbaoxian.cn';
  } else if (location.hostname.search(/192\.168|localhost/) !== -1) {
    // 开发环境接口地址
    env = 'https://app.winbaoxian.cn';
  }
  return env;
})();

// 创建axios实例
const service = axios.create({
  baseURL: BASE_API,
  withCredentials: true,
  timeout: 5000, // 请求超时时间
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let loadingTimer = null;
const loading = show => {
  if (window.appBridge && window.appBridge.showLoading) {
    if (show) {
      window.appBridge.showLoading();
    } else {
      window.appBridge.hideLoading();
    }
  }
};

// request拦截器
service.interceptors.request.use(
  config => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loadingTimer = setTimeout(() => {
      let configData = null;
      if (config.data) {
        configData = JSON.parse(config.data);
      }
      loading(configData && configData.withoutLoading ? false : true);
    }, 300);

    return config;
  },
  error => {
    // Do something with request error
    console.log(error); // for debug
    Promise.reject(error);
  }
);

// respone拦截器
service.interceptors.response.use(
  response => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loading(false);
    const res = response.data;
    if (
      res.code === 401 ||
      res.status === 401 ||
      (res.data && res.data.data === NOT_LOGGED_IN_CODE)
    ) {
      gotoLogin();
      return Promise.reject('login');
    }
    return res;
  },
  error => {
    if (loadingTimer) clearTimeout(loadingTimer);
    loading(false);
    if (error.response && error.response.status == 401) {
      gotoLogin();
      return Promise.reject('login');
    }
    console.log('err' + error); // for debug
    return Promise.reject(error);
  }
);

export default service;
