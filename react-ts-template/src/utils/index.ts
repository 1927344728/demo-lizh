import IDValidator from 'id-validator'
import GB2260 from 'id-validator/src/GB2260'

import {
  IS_PRODUCT,
  SAFE_AREA_INSET_BOTTOM,
  URL_PARAM
} from './variables'

export * from './variables'
export * from './url'

export function getTimeStr (time : number) : string {
  const second = Math.round((new Date().getTime() - time) / 1000)
  if (second < 60) {
    return `${second}秒前`
  }
  if (second >= 60 && second < 60 * 60) {
    return `${Math.round(second / 60)}分钟前`
  }
  if (second >= 60 * 60 && second < 60 * 60 * 24) {
    return `${Math.round(second / 60 / 60)}小时前`
  }
  if (second >= 60 * 60 * 24 && second < 60 * 60 * 24 * 30) {
    return `${Math.round(second / 60 / 60 / 24)}天前`
  }
  return ''
}

export function numberToChinese (number : number) : any {
  const units = '个十百千万@#%亿^&~'
  const chars = '零一二三四五六七八九'
  const a : Array<string> = (number + '').split('')
  const s : Array<string> = []

  if (a.length > 12) {
    throw new Error('too big')
  } else {
    for (let i = 0, j = a.length - 1; i <= j; i++) {
      const index = Number(a[i])
      if (j === 1 || j === 5 || j === 9) {
        if (i === 0) {
          if (a[i] !== '1') { s.push(chars.charAt(index)) }
        } else {
          s.push(chars.charAt(index))
        }
      } else {
        s.push(chars.charAt(index))
      }
      if (i !== j) {
        s.push(units.charAt(j - i))
      }
    }
  }

  const NUM_SYMBOL_MAP : any = {
    '@': '十',
    '#': '百',
    '%': '千',
    '^': '十',
    '&': '百',
    '~': '千'
  }
  return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) { // 优先处理 零百 零千 等
    b = units.indexOf(d)
    if (b !== -1) {
      if (d === '亿') { return d }
      if (d === '万') { return d }
      if (a[a.length - b] === '0') { return '零' }
    }
    return ''
  }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) { // 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
    return b
  }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, (m : string) => NUM_SYMBOL_MAP[m]).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
    c = units.indexOf(d)
    if (c !== -1) {
      if (a[a.length - c] === '0') { return d + '零' + b }
    }
    return m
  })
}

export function WeiyiStatSDKInit ({
  pageId = '',
  isProduct = IS_PRODUCT,
  heartBeatRate = 1000,
  projectInfo = {
    url: window.location.href
  }
} : {
  pageId: string;
  isProduct?: boolean;
  heartBeatRate?: number;
  projectInfo?: any;
}) : void {
  window.WeiyiStatSDK && window.WeiyiStatSDK.init({
    pageId,
    isProduct,
    heartBeatRate,
    projectInfo
  })
}

export function gotoLogin () : any {
  if (window.appBridge && window.appBridge.checkAppFeature('APP_VIEW')) {
    window.appBridge.gotoAppView('login')
  } else if (URL_PARAM.isMiniprogram) {
    window.wx && window.wx.miniProgram.navigateTo({ url: '/pages/index/index' })
  } else {
    window.window.location.href = `https://app.winbaoxian.${IS_PRODUCT ? 'com' : 'cn'}/user/login?requestUrl=${encodeURIComponent(window.location.href)}`
  }
}

export function parseTime (time : number | Date, cFormat : string) : string | null {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (time === null) {
    return null
  } else if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) { time = parseInt(time + '') * 1000 }

    date = new Date(time)
  }
  const formatObj : any = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return [
        '日',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六'
      ][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

export function getAgeFromBirth (birth : number | Date, cDate : number | Date) : number {
  const nowDate = cDate ? (new Date(cDate)) : (new Date())
  const bDate = new Date(birth)
  let age = nowDate.getFullYear() - bDate.getFullYear()
  if (nowDate.getMonth() - bDate.getMonth() < 0 || (nowDate.getMonth() - bDate.getMonth() === 0 && nowDate.getDate() - bDate.getDate() < 0)) {
    age--
  }
  return age
}

export function deepCopy (obj : any, hash = new WeakMap()) : any {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  let newObj
  const Constructor = obj.constructor
  switch (Constructor) {
    case RegExp: newObj = new Constructor(obj)
      break
    case Date: newObj = new Constructor(obj.getTime())
      break
    default: newObj = new Constructor()
      break
  }

  hash.set(obj, newObj)
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key], hash) : obj[key]
    }
  }

  return newObj
}

export const idVlidator = new IDValidator(GB2260)
let positionTop = 0
export function stopBodyScroll (isFixed : boolean) : any {
  if (document) {
    const bodyEl = document.body
    if (isFixed) {
      positionTop = window.scrollY

      bodyEl.style.position = 'fixed'
      bodyEl.style.top = -positionTop + 'px'
      document.documentElement.style.height = (window.innerHeight + SAFE_AREA_INSET_BOTTOM) + 'px'
    } else {
      bodyEl.style.position = ''
      bodyEl.style.top = ''
      document.documentElement.style.height = ''

      window.scrollTo(0, positionTop) // 回到原先的top
    }
  }
}

export function convertNumberToWan (value : number) : any {
  return value >= 10000 && !(value % 10000) ? value / 10000 + '万' : value
}

export function setDocumentAndWebviewTitle (title : string) : void {
  document.title = title
  if (window.appBridge && window.appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')) {
    window.appBridge.changeWebviewTitle(document.title)
  }
}

export function setHTMLFontSize () : any {
  document.documentElement.style.fontSize = 16 * Math.min(document.documentElement.clientWidth / 375, 2) + 'px'
  window.onresize = () => {
    document.documentElement.style.fontSize = 16 * Math.min(document.documentElement.clientWidth / 375, 2) + 'px'
  }
  fixedViewportOffset()
}

/**
 * IOS 12以上，(app4.6.0或者 app.4.8及以上版本)或者(微信)中元素错位问题
 */
export function fixedViewportOffset () : any {
  const iosVersion : any = navigator.userAgent.toLowerCase().match(/cpu iphone os ((\d*)_(.*)?) like mac os/)
  if (iosVersion && iosVersion[2] && iosVersion[2] >= 12) {
    const appVersion = window.appBridge.isApp() && /weiyi\/((\d+)(\.(\d+))?(\.(\d+))?)?\s/ig.exec(navigator.userAgent.toLowerCase()) // 版本升级提示
    if ((appVersion && ((appVersion[2] === 4 && (appVersion[4] === 6 || appVersion[4] >= 8)) || appVersion[2] >= 5)) || window.appBridge.isWechat() || window.appBridge.isApp()) {
      document.body.addEventListener('blur', (e : any) => {
        if (['TEXTAREA', 'INPUT', 'SELECT'].indexOf(e.target.tagName) !== -1) {
          setTimeout(function () {
            window.scrollTo(0, document.documentElement.scrollTop || document.body.scrollTop)
          }, 100)
        }
      }, true)
    }
  }
}

export function initPageBasicConfig (options : any = {}) : void {
  setHTMLFontSize()
  fixedViewportOffset()
  if (options.statSDKPageId) {
    WeiyiStatSDKInit({
      pageId: options.statSDKPageId
    })
  }
  if (options.documentTitle) {
    setDocumentAndWebviewTitle(options.documentTitle)
  }
  if (options.pageWrapperDom) {
    options.pageWrapperDom.style.minHeight = window.innerHeight + SAFE_AREA_INSET_BOTTOM + 'px'
  }
}

export default {
  getTimeStr,
  numberToChinese,
  WeiyiStatSDKInit,
  gotoLogin,
  parseTime,
  deepCopy,
  stopBodyScroll,
  convertNumberToWan,
  setDocumentAndWebviewTitle,
  setHTMLFontSize,
  fixedViewportOffset,
  initPageBasicConfig
}
