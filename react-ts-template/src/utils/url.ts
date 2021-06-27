import QS from 'querystring'

export function getUrlParams (key: string | null = null, URL : string = window.location.href) : any {
  let searchStr = ''
  if (URL) {
    searchStr = URL.match(/\?/) ? URL.split('?')[1] : URL.match(/=/) ? URL : ''
  }
  const params : any = searchStr ? QS.parse(searchStr) : {}
  if (key && typeof key === 'string') {
    return params[key]
  }
  return params
}

export function setUrlParams (obj : any = {}, URL : string = window.location.href) : string {
  if (!Object.keys(obj).length) {
    return URL
  }
  const params = getUrlParams(null, URL)
  for (const k in obj) {
    params[k] = obj[k]
  }
  const newURL = URL.match(/\?/) ? URL.split('?')[0] : URL
  if (params && QS.stringify(params)) {
    return `${newURL}?${QS.stringify(params)}`
  }
  return newURL
}

export function deleteUrlParams (keys : string | Array <string>, URL : string = window.location.href) : string {
  if (!keys) {
    return URL
  }
  const params = getUrlParams(null, URL)
  if (typeof keys === 'string') {
    if (params[keys]) {
      delete params[keys]
    }
  } else if (Array.isArray(keys)) {
    for (const k of keys) {
      if (params[k]) {
        delete params[k]
      }
    }
  }
  const newURL = URL.match(/\?/) ? URL.split('?')[0] : URL
  if (params && QS.stringify(params)) {
    return `${newURL}?${QS.stringify(params)}`
  }
  return newURL
}
