import { IS_PRODUCT_ENV, APP_CHANNEL, SAFE_AREA_INSET_BOTTOM } from '@/utils/variables.js'

export function getTimeStr(time) {
  let second = Math.round((new Date() - time) / 1000)
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
}

export function numberToChinese(number) {
  const units = '个十百千万@#%亿^&~';
  const chars = '零一二三四五六七八九';
  const a = (number + '').split('');
  const s = [];

  if (a.length > 12) {
    throw new Error('too big');
  } else {
    for (let i = 0, j = a.length - 1; i <= j; i++) {
      if (j == 1 || j == 5 || j == 9) { // 两位数 处理特殊的 1*
        if (i == 0) {
          if (a[i] != '1') {
            s.push(chars.charAt(a[i]));
          }
        } else {
          s.push(chars.charAt(a[i]));
        }
      } else {
        s.push(chars.charAt(a[i]));
      }
      if (i != j) {
        s.push(units.charAt(j - i));
      }
    }
  }
  return s.join('').replace(/零([十百千万亿@#%^&~])/g, function (m, d, b) { // 优先处理 零百 零千 等
    b = units.indexOf(d);
    if (b != -1) {
      if (d == '亿') {
        return d;
      }
      if (d == '万') {
        return d;
      }
      if (a[j - b] == '0') {
        return '零'
      }
    }
    return '';
  }).replace(/零+/g, '零').replace(/零([万亿])/g, function (m, b) { // 零百 零千处理后 可能出现 零零相连的 再处理结尾为零的
    return b;
  }).replace(/亿[万千百]/g, '亿').replace(/[零]$/, '').replace(/[@#%^&~]/g, function (m) {
    return {
      '@': '十',
      '#': '百',
      '%': '千',
      '^': '十',
      '&': '百',
      '~': '千'
    }[m];
  }).replace(/([亿万])([一-九])/g, function (m, d, b, c) {
    c = units.indexOf(d);
    if (c != -1) {
      if (a[j - c] == '0') {
        return d + '零' + b
      }
    }
    return m;
  });
}

export function WeiyiStatSDKInit(options = {}) {
  window.WeiyiStatSDK && window.WeiyiStatSDK.init({
    pageId: options.pageId || '',
    isProduct: options.isProduct !== undefined ? options.isProduct : IS_PRODUCT_ENV, // [必填] false: 测试环境、true: 正式环境
    heartBeatRate: options.heartBeatRate || 1000,
    projectInfo: options.projectInfo || {
      url: location.href
    },

    // 以下参数为错误上报专用参数
    Vue: options.Vue || window.Vue, // 可选, 也可前置 window.Vue = Vue 来代替
    name: options.name || '', // 必选, package.json 中的 name
    version: options.version || '', // 必选, package.json 中的 version
  })
}

export function gotoLogin() {
  if (window.appBridge && window.appBridge.checkAppFeature('APP_VIEW')) {
    appBridge.gotoAppView('login')
    return
  }
  if (['WXWORK', 'WXQYH'].includes(APP_CHANNEL)) {
    window.WeCom && window.WeCom.gotoLogin()
    return
  }
  if (window.WeCom && WeCom.isMiniBankInsurance()) {
    WeCom.gotoLogin()
    return
  }
  if (['WXMP'].includes(APP_CHANNEL)) {
    window.wx && window.wx.miniProgram.navigateTo({ url: '/pages/index/index' })
    return
  }
  if (window.WeCom && WeCom.gotoLogin && window.WeCom.WEIYI_APPID) {
    WeCom.gotoLogin()
    return
  }
  window.location.href = `https://app.winbaoxian.${IS_PRODUCT_ENV ? 'com' : 'cn'}/user/login?requestUrl=${encodeURIComponent(location.href)}`
}

export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (time === null) {
    return;
  } else if (typeof time === 'object') {
    date = time;
  } else {
    if (('' + time).length === 10) {
      time = parseInt(time) * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    if (key === 'a') {
      return [
        '日',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六',
      ][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return timeStr;
}

// 函数：根据生日算年龄
// 参数：birth为时间字符串或时间翟；cDate为指定时间，不传默认为当前时间
export function getAgeFromBirth(birth, cDate) {
  const nowDate = cDate ? (new Date(cDate)) : (new Date())
  const bDate = new Date(birth)
  let age = nowDate.getFullYear() - bDate.getFullYear()
  if (nowDate.getMonth() - bDate.getMonth() < 0 || (nowDate.getMonth() - bDate.getMonth() === 0 && nowDate.getDate() - bDate.getDate() < 0)) {
    age--
  }
  return age
}

// 函数：Obj深度考贝
// 参数：target为最终返回的对象；origial为需要复制的数据源
export function deepCopy(obj, hash = new WeakMap()) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  let newObj;
  let Constructor = obj.constructor;
  switch (Constructor) {
    case RegExp: newObj = new Constructor(obj);
      break;
    case Date: newObj = new Constructor(obj.getTime());
      break;
    default: newObj = new Constructor();
      break;
  }

  hash.set(obj, newObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key], hash) : obj[key];
    }
  }

  return newObj;
}

let positionTop = 0
export function stopBodyScroll(isFixed) {
  if (!document) {
    return
  }
  const bodyEl = document.body
  if (isFixed) {
    positionTop = window.scrollY

    bodyEl.style.position = 'fixed'
    bodyEl.style.top = - positionTop + 'px'
    document.documentElement.style.height = (window.innerHeight + SAFE_AREA_INSET_BOTTOM) + 'px'
  } else {
    bodyEl.style.position = ''
    bodyEl.style.top = ''
    document.documentElement.style.height = ''
    window.scrollTo(0, positionTop) // 回到原先的top
  }
}

export function setDocumentAndViewportTitle(title) {
  document.title = title
  if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')) {
    appBridge.changeWebviewTitle(document.title);
  }
}

export function setHTMLFontSize() {
  const baseFontSize = 16
  const realFontSize = Math.min(baseFontSize * document.documentElement.clientWidth / 375, baseFontSize * 1.75)
  document.documentElement.style.fontSize = `${realFontSize}px`
  window.onresize = () => {
    document.documentElement.style.fontSize = `${realFontSize}px`
  }
}

export function setThinnerBorder() {
  if (window.devicePixelRatio && devicePixelRatio >= 2) { // 高分辨率上1px问题
    const divElem = document.createElement('div');
    divElem.style.border = '.5px solid transparent';
    document.body.appendChild(divElem);
    if (divElem.offsetHeight == 1) {
      document.querySelector('html').classList.add('hairlines');
    }
    document.body.removeChild(divElem);
  }
}

// IOS 12以上，(app4.6.0或者 app.4.8及以上版本)或者(微信)中元素错位问题
export function patchIOSViewportOffset() {
  const iosVersion = navigator.userAgent.toLowerCase().match(/cpu iphone os ((\d*)_(.*)?) like mac os/)
  if (!(iosVersion && iosVersion[2] && iosVersion[2] >= 12)) {
    return
  }
  if (!window.Jax || !(window.Jax.isApp() || window.Jax.isWeChat())) {
    return
  }
  document.body.addEventListener('blur', function (e) {
    if (["TEXTAREA", "INPUT", "SELECT"].indexOf(e.target.tagName) === -1) {
      return
    }
    setTimeout(function () {
      window.scrollTo(0, document.documentElement.scrollTop || document.body.scrollTop);
    }, 100)
  }, true)
}

export function initBasicConfig(options = {}) {
  setHTMLFontSize()
  setThinnerBorder()
  patchIOSViewportOffset()
  if (options.statSDKPageId) {
    WeiyiStatSDKInit({ pageId: options.statSDKPageId })
  }
  if (options.documentTitle) {
    setDocumentAndViewportTitle(options.documentTitle)
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
  setHTMLFontSize,
  setThinnerBorder,
  patchIOSViewportOffset,
  setDocumentAndViewportTitle,
  initBasicConfig
}
