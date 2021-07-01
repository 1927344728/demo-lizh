import axios from 'axios'

const isProd = location.hostname.search(/\.winbaoxian\.com/) !== -1
const BaseUrl = `${location.protocol}//app.winbaoxian.${isProd ? 'com' : 'cn'}`
const Jweixin = '//res.wx.qq.com/open/js/jweixin-1.3.2.js'

let appShareConfig : any = null
let h5ButtonShareCfg : any = null

/**
 * 简化分享，调用initShareAction方法，即可完成各类分享的参数配置。同时也可以调用nativeShare、h5ButtonShare、wechatShare
 * 根据config参数，可生成QQ、微信好友、微信朋友圈、小程序、h5按钮分享、微信二次分享。
 * shareType，指定需要分享的类型
 * shareItemInfo,传参参考appBridge。优先级高，若此参数中有对应分享类型的值，则此不会取config中的值
 */

/**
 * @Author   Lizh
 * @DateTime 2019-08-01
 * @param    {[string]}   options.title     [分享标题]
 * @param    {[string]}   options.content   [分享描述]
 * @param    {[string]}   options.imgUrl    [分享图标]
 * @param    {[string]}   options.shareUrl  [分享链接]
 * @param    {Array}    shareType         [分享类型，可不传。可传参数参考ShareType变量]
 * @param    {[Array]}   shareItemInfo     [分享配置，可不传，具体查看appBridge接口文档中，ShareItemInfo: 分享按钮信息]
 * @return   {[type]}                     [description]
 */
function initShareAction (
  {
    title,
    content,
    imgUrl,
    shareUrl
  } : any,
  shareType = [
    'qq_friends',
    'wechat_timeline',
    'wechat_friends',
    'wechatShare'
  ],
  shareItemInfo : any
) : void {
  appShareConfig = []
  if (shareType && shareType.length) {
    shareType.map(action => {
      const sConfig =
        shareItemInfo &&
        shareItemInfo.filter((item : any) => item.action === action)[0]
      // 小程序分享
      if (action === 'miniProgramData') {
        appShareConfig.push(
          sConfig || {
            action: 'miniProgramData', // 分享渠道, 当前支持: qq_friends(QQ好友)、wechat_timeline(微信朋友圈)、wechat_friends(微信朋友)、miniProgramData(微信小程序)
            webPageUrl: 'https://www.winbaoxian.com/', // 兼容低版本的网页链接
            userName: 'gh_290a5ead8e96', // 小程序原始id
            path: '/pages/index/main',
            title, // 小程序消息title
            description: content, // 小程序消息desc
            imageUrl: imgUrl, // 小程序消息封面图片，小于128k
            miniprogramType: isProd ? 0 : 2 // 【3.11.0 新增参数】 0: 正式版、1: 开发版、2: 体验版
          }
        )
      } else if (action === 'h5ButtonShare') {
        // app内，点击按钮分享
        h5ButtonShareCfg = sConfig || {
          title, // 分享标题、type=2时表示视频标题
          content, // 分享内容的详细描述、type=2时表示视频描述
          imgUrl, // 图片地址、type=2时表示视频缩略图
          shareUrl, // 要分享的链接(一般为当前页面)、type=2时表示视频 url
          introduction: content, // 分享弹框的头部文案
          shareChannel: ['qq_friends', 'wechat_timeline', 'wechat_friends']
        }
      } else if (action === 'wechatShare') {
        // 页面分享到微信处，微信二次分享
        wechatShare(
          sConfig || {
            title, // 分享标题
            desc: content, // 分享描述
            link: shareUrl, // 分享链接
            imgUrl // 分享图标
          },
          location.href
        )
      } else {
        // app内QQ、微信好友、微信朋友圈、小程序分享
        appShareConfig.push(
          sConfig || {
            action, // 分享渠道, 当前支持: qq_friends(QQ好友)、wechat_timeline(微信朋友圈)、wechat_friends(微信朋友)、miniProgramData(微信小程序)
            title, // 分享标题、type=2时表示视频标题
            content, // 分享的内容、type=2时表示视频描述
            shareUrl, // 分享的链接、type=2时表示视频 url
            imgUrl // 分享类型: 图片下载地址、type=2时表示视频缩略图
          }
        )
      }
    })
  }
  appShareConfig && appShareConfig.length && nativeShare(appShareConfig)
}

/**
 * @Author   Lizh
 * @DateTime 2019-07-26
 * @param    {[type]}   pageGroup [description],具体查看appBridge接口文档中，ShareItemInfo: 分享按钮信息
 * @return   {[type]}             [description]
 */
function nativeShare (pageGroup : any) : void {
  // 原生分享功能，功能集合
  if (window.appBridge && window.appBridge.isApp()) {
    if (window.appBridge.checkAppFeature('COMMON_ACTION_SHEET')) {
      window.appBridge.commonActionSheet({
        successFunc: function () {
          // 功能按钮执行成功的回调 (可选参数)
          /**
           *  {
           *    action: '', // 该按钮的action值(必有)
           *    targetType: '' // 该按钮操作的上下文(选有)  : 在2.7.0-ios版本中,该参数永远不会被返回，2.8.0修复了该问题
           *  }
           */
        },
        errorFunc: function (error : Error) {
          // 功能按钮执行失败的回调 (可选参数)
          console.log('错误: ' + error.name + ' ' + error.message) // eg: "错误: nativeError 缺少参数"
        },
        shareGroup: pageGroup // 分享渠道集合
        // actionGroup: nativeGroup || [] // 功能按钮集合
      })
    } else {
      window.appBridge.showUpdateAppH5()
    }
  }
}

/**
 * @Author   Lizh
 * @DateTime 2019-07-26
 * @param    {[type]}   pageGroup [description]，具体查看appBridge接口文档中，ShareItemInfo: 分享按钮信息
 * @return   {[type]}               [description]
 */
function h5ButtonShare (pageGroup : any) : void {
  if (window.appBridge && window.appBridge.isApp()) {
    if (window.appBridge.checkAppFeature('DIRECT_SHOW_ACTION_SHEET')) {
      window.appBridge.directShowActionSheet({
        successFunc: function () {
          // 功能按钮执行成功的回调 (可选参数)
          /**
           *  {
           *    action: '', // 该按钮的action值(必有)
           *    targetType: '' // 该按钮操作的上下文(选有)  : 在2.7.0-ios版本中,该参数永远不会被返回，2.8.0修复了该问题
           *  }
           */
        },
        errorFunc: function (error : Error) {
          // 功能按钮执行失败的回调 (可选参数)
          console.log('错误: ' + error.name + ' ' + error.message) // eg: "错误: nativeError 缺少参数"
        },
        shareGroup: pageGroup || h5ButtonShareCfg || appShareConfig // 分享渠道集合
      }) // params参数请参考 commonActionSheet 方法
    } else {
      window.appBridge.showUpdateAppH5()
    }
  }
}

/**
 * @Author   Lizh
 * @DateTime 2019-07-26
 * @param    {[type]}   url [需要加载的js链接]
 * @return   {[type]}       [返回Promise]
 */
function dynamicLoadingJs (url : string) : any {
  return new Promise(function (resolve) {
    const myScript = document.createElement('script')
    myScript.type = 'text/javascript'
    myScript.async = false
    myScript.src = url
    myScript.onload = function (res) {
      resolve(res)
    }
    document.body.appendChild(myScript)
  })
}

/**
 * @Author   Lizh
 * @DateTime 2019-08-01
 * @param    {[string]}   options.title   [分享标题]
 * @param    {[string]}   options.link    [分享链接]
 * @param    {[string]}   options.imgUrl  [分享图标]
 * @param    {[string]}   options.desc    [分享描述]
 * @param    {[Function]}   options.success [Function || NOOP回调函数]
 * @param    {[string]}   ticketLink      [需要生成签名的链接，一般为当前链接]
 * @return   {[type]}                   [description]
 */
function wechatShare ({ title, link, imgUrl, desc, success } : any, ticketLink : string) : any {
  const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase())
  if (!inWechat) return
  dynamicLoadingJs(Jweixin).then(() => {
    return axios
      .get(`${BaseUrl}/weChat/jsApiTicket/get`, { params: { url: ticketLink } })
      .then(({ data }) => {
        const { appId, timestamp, nonceStr, signature } = data.data
        const NOOP = function () {
          console.log('NOOP')
        }

        if (data.success) {
          window.wx.config({
            debug: false,
            appId, // 必填，公众号的唯一标识
            timestamp, // 必填，生成签名的时间戳
            nonceStr, // 必填，生成签名的随机串
            signature, // 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
          })
          window.wx.ready(function () {
            window.wx.onMenuShareTimeline({
              // debug: true,
              title, // 分享标题
              link, // 分享链接
              imgUrl, // 分享图标
              success: success || NOOP
            })
            window.wx.onMenuShareAppMessage({
              // debug: true,
              title, // 分享标题
              desc, // 分享描述
              link, // 分享链接
              imgUrl, // 分享图标
              success: success || NOOP
            })
          })
          window.wx.error(function () {
            console.log('window.wx.error')
          })
        } else {
          console.log(data.info)
        }
      })
  })
}

export { initShareAction, nativeShare, h5ButtonShare, wechatShare }
