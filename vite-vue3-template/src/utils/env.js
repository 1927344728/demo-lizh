const ua = navigator.userAgent
const env = {
  isAndroid: /Android/i.test(ua),
  isIos: /(iPhone|iPad|iPod)/i.test(ua),
  supportTouch: (function isSupportTouch() {
    return !!(
      'ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    )
  })(),
}

const DEVICE_VIEWPORT_SPECS = [
  [375, 812, 3], // iPhone X, 11 Pro,
  [414, 896, 2], // iPhone XR, 11,
  [414, 896, 3], // iPhone XS Max, 11 Pro Max,
  [390, 844, 3], // iPhone 12, 12 Pro,
  [428, 926, 3], // iPhone 12 Pro Max,
].map(it => it.join(','))

export const isAfterIphoneX = () => {
  if (!/iphone/gi.test(ua)) {
    return false
  }
  const { width, height } = window.screen
  const demensions = (width > height
    ? [height, width]
    : [width, height]
  ).concat(window.devicePixelRatio)
  return DEVICE_VIEWPORT_SPECS.indexOf(demensions.join(',')) !== -1
}

export function addXSupport() {
  const $viewport = document.querySelector('meta[name=viewport]')
  if (!$viewport || !isAfterIphoneX()) {
    return false
  }
  let content = $viewport.getAttribute('content')
  if (content.indexOf('viewport-fit') !== -1) {
    return false
  }
  content += ',viewport-fit=cover'
  $viewport.setAttribute('content', content)
  return true
}

export default env
