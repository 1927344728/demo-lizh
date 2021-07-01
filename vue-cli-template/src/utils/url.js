import QS from 'querystring'
/**
 * 获取URL参数
 * @param {*} key 
 * @param {*} url 
 */
export function getUrlParams (key, url = location.href) {
  let searchStr = ''
  if (url) {
    searchStr = url.match(/\?/) ? url.split('?')[1] : url.match(/=/) ? url : ''
  }
  let params = {}
  if (searchStr) {
    params = QS.parse(searchStr)
  }
  if (key && typeof key === 'string') {
    return params[key]
  } else {
    return params
  }
}

/**
 * 设置URL参数
 * @param {*} key 
 * @param {*} url 
 */
export function setUrlParams (obj = {}, url = location.href) {
  if (!Object.keys(obj).length) {
    return url
  }
  let params = getUrlParams(null, url) || {}
  for (let k in obj) {
    params[k] = obj[k]
  }
  let path = url.match(/\?/) ? url.split('?')[0] : url
  if (params && QS.stringify(params)) {
    return `${path}?${QS.stringify(params)}`
  } else {
    return path
  }
}

/**
 * 删除URL参数
 * @param {*} key 
 * @param {*} value 
 * @param {*} url 
 */
export function deleteUrlParam (keys, url = location.href) {
  if (!keys) {
    return url
  }
  let params = getUrlParams(null, url) || {}
  if (typeof keys === 'string') {
    if (params[keys]) {
      delete params[keys]
    }
  } else if (Array.isArray(keys)) {
    for (let k of keys) {
      if (params[k]) {
        delete params[k]
      }
    }
  }
  let path = url.match(/\?/) ? url.split('?')[0] : url
  if (params && QS.stringify(params)) {
    return `${path}?${QS.stringify(params)}`
  } else {
    return path
  }
}