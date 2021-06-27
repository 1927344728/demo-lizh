const ua = navigator.userAgent
const env = {
  isAndroid: /Android/i.test(ua),
  isIos: /(iPhone|iPad|iPod)/i.test(ua),
  supportTouch: (function isSupportTouch () {
    return !!(
      'ontouchstart' in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch)
    )
  })()
}

const isIphoneX = () : any =>
  /iphone/gi.test(window.navigator.userAgent) &&
  window.devicePixelRatio &&
  window.devicePixelRatio === 3 &&
  ((window.screen.width === 375 && window.screen.height === 812) ||
    (window.screen.height === 375 && window.screen.width === 812))

const isIphoneXR = () : any =>
  /iphone/gi.test(window.navigator.userAgent) &&
  window.devicePixelRatio &&
  window.devicePixelRatio === 2 &&
  ((window.screen.width === 414 && window.screen.height === 896) ||
    (window.screen.height === 414 && window.screen.width === 896))

const iphoneXSMax = () : any =>
  /iphone/gi.test(window.navigator.userAgent) &&
  window.devicePixelRatio &&
  window.devicePixelRatio === 3 &&
  ((window.screen.width === 414 && window.screen.height === 896) ||
    (window.screen.height === 414 && window.screen.width === 896))

export const isAfterIphoneX = () : any => isIphoneX() || isIphoneXR() || iphoneXSMax()

export function addXSupport () : any {
  const $viewport = document.querySelector('meta[name=viewport]')
  if (!$viewport || !isAfterIphoneX()) {
    return false
  }
  let content : any = $viewport.getAttribute('content')
  if (content.indexOf('viewport-fit') !== -1) {
    return false
  }
  content += ',viewport-fit=cover'
  $viewport.setAttribute('content', content)
  return true
}

export default env
