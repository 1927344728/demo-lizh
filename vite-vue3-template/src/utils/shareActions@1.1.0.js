/**
 * version: 1.1.0
 * Author: Lizhao
 * 描述：封装 APP 原生分享、APP 内 h5 点击分享、微信分享
 * 升级：与 1.0.0 相对，降低函数之间的耦合度，增强函数灵活性
 */

 import axios from 'axios';

 const IS_PRODUCT_ENV = location.hostname.search(/\.winbaoxian\.com/) !== -1;
 const JWEIXIN_URL = 'http://res.wx.qq.com/open/js/jweixin-1.6.0.js';
 let appShareConfig = [];
 /**
  * 初始化分享信息，并且默认调用 APP 原生分享、微信分享。
  * @param {Object} config 分享信息
  * @param {string} config.title  分享标题
  * @param {string} config.content   分享描述
  * @param {string} config.imgUrl    分享图片
  * @param {string} config.shareUrl  分享链接
  * @param {Object} options 一些可选参数
  * @param {Array} options.shareActions 初始化时，立即执行的分享函数。默认 ['native', 'wechat']，即默认执行 APP 原生分享、微信分享。如果传空或空数组，表示只初始化数据，不执行任何分享操作。
  * @param {Array} options.detailConfig 为不同分享类型配置分享信息。数组元素可以是字符串（分享类型），也可以是一个对象，对象为对应分享类型的分享信息
  * @param {Boolean} options.debug 是否开启微信分享的调试模式，默认不开启
  * @param {String} options.jweixinUrl 微信 JSSDK 的 URL，默认 jweixin-1.6.0.js
  * @param {String} options.ticketLink 微信需要生成签名的链接，默认当前链接
  * @param {String} options.appId 微信设置 “JS接口安全域名” 的公众号 AppId，默认 wxe2a04a49c02b1d5d，即微易计划书公众号AppId
  * @param {Array} options.jsApiList 需要使用的 JS 接口列表。默认 ['onMenuShareTimeline', 'onMenuShareAppMessage']
  * @param {Function} options.wxReadyCallback wx.ready 事件执行的回调函数。
  * @return {Array} 分享渠道配置集合
  *
  * @example
  * initShareAction({
  *   title: 'shareActions@1.1.0.js',
  *   content: '分享封装测试页面',
  *   imgUrl: 'https://img.zcool.cn/community/01oaore23tajsdjgptao7q3030.jpg',
  *   shareUrl: location.href,
  *   success: null,
  * })
  * initShareAction({
  *   title: 'shareActions@1.1.0.js',
  *   content: '分享封装测试页面',
  *   imgUrl: 'https://img.zcool.cn/community/01oaore23tajsdjgptao7q3030.jpg',
  *   shareUrl: location.href
  * }, {
  *   shareActions: ['native', 'wechat'],
  *   detailConfig: [
  *     'qq_friends',
  *     'wechat_timeline',
  *     {
  *       action: 'wechat_friends',
  *       title: '微信好友自定义标题',
  *       content: '分享封装测试页面',
  *       imgUrl: null,
  *       shareUrl: location.href
  *     },
  *     {
  *       action: 'miniProgramData',
  *       webPageUrl: 'https://www.winbaoxian.com/',
  *       userName: 'gh_290a5ead8e96',
  *       path: '/pages/index/main',
  *       title: 'shareActions（小程序）',
  *       description: '分享封装测试页面',
  *       imageUrl: null,
  *       miniprogramType: 2,
  *     },
  *   ],
  *   debug: true,
  *   jweixinUrl: '',
  *   ticketLink: '',
  *   appId: 'wxe2a04a49c02b1d5d',
  *   jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'hideMenuItems'],
  *   wxReadyCallback: () => {
  *     wx.hideMenuItems({
  *       menuList: ['menuItem:copyUrl']
  *     });
  *     console.log('wxReadyCallback');
  *   },
  * })
  */
 export function initShareAction(config, options = {}) {
   const { title, content, imgUrl, shareUrl, success, lazyDataCb } = config;
   const {
     shareActions = ['native', 'wechat'],
     debug,
     jweixinUrl,
     ticketLink,
     appId,
     jsApiList,
     wxReadyCallback,
   } = options;
   const detailConfig = options.detailConfig || [
     'qq_friends',
     'wechat_timeline',
     'wechat_friends',
   ];
   appShareConfig = [];
   detailConfig.map(conf => {
     if (Object.prototype.toString.apply(conf) === '[object Object]') {
       appShareConfig.push(conf);
       return;
     }
     if (Object.prototype.toString.apply('') === '[object String]') {
       switch (conf) {
         // APP原生分享信息：小程序
         // http://wy-front.git-page.winbaoxian.com/lib-app-webview-bridge1/#/api?id=通用-actionsheet-接口
         case 'miniProgramData': {
           appShareConfig.push({
             action: conf,
             webPageUrl: 'https://www.winbaoxian.com/', // 兼容低版本的网页链接
             userName: 'gh_f4ec08e66bd6', // 小程序原始id
             path: '/pages/index/index',
             title, // 小程序消息title
             description: content, // 小程序消息desc
             imageUrl: imgUrl, // 小程序消息封面图片，小于128k
             miniprogramType: IS_PRODUCT_ENV ? 0 : 2, // 【3.11.0 新增参数】 0: 正式版、1: 开发版、2: 体验版
           });
           break;
         }
         // APP原生分享信息：QQ分享、微信朋友圈、微信朋友
         case 'qq_friends':
         case 'wechat_timeline':
         case 'wechat_friends': {
           appShareConfig.push({
             action: conf, // 分享渠道, 当前支持: qq_friends(QQ好友)、wechat_timeline(微信朋友圈)、wechat_friends(微信朋友)、miniProgramData(微信小程序)
             title, // 分享标题、type=2时表示视频标题
             content, // 分享的内容、type=2时表示视频描述
             shareUrl, // 分享的链接、type=2时表示视频 url
             imgUrl, // 分享类型: 图片下载地址、type=2时表示视频缩略图
             success,
             lazyDataCb
           });
           break;
         }
       }
     }
   });
   if (shareActions && shareActions.includes('native')) {
     nativeShare(appShareConfig);
   }
   if (shareActions && shareActions.includes('wechat')) {
     wechatShare(
       {
         title,
         link: shareUrl,
         imgUrl,
         desc: content,
         success,
       },
       {
         debug,
         jweixinUrl,
         ticketLink,
         appId,
         jsApiList,
         wxReadyCallback,
       }
     );
   }
   return appShareConfig;
 }
 
 /**
  * APP 原生分享
  * http://wy-front.git-page.winbaoxian.com/lib-app-webview-bridge1/#/api?id=通用-actionsheet-接口
  * @param {Array} shareGroup 分享渠道集合
  */
 export function nativeShare(shareGroup) {
   if (!(appBridge && appBridge.isApp())) {
     return;
   }
   if (!appBridge.checkAppFeature('COMMON_ACTION_SHEET')) {
     appBridge.showUpdateAppH5();
     return;
   }
   console.log('commonActionSheet: ', shareGroup);
   appBridge.commonActionSheet({
     successFunc: function() {},
     errorFunc: function(error) {
       throw error;
     },
     shareGroup,
   });
 }
 
 /**
  * APP 内 H5 点击分享
  * http://wy-front.git-page.winbaoxian.com/lib-app-webview-bridge1/#/api?id=直接显示-actionsheet
  * @param {Array} config 分享渠道集合
  */
 export function h5ButtonShare(config) {
   if (!(appBridge && appBridge.isApp())) {
     return;
   }
   if (!appBridge.checkAppFeature('DIRECT_SHOW_ACTION_SHEET')) {
     appBridge.showUpdateAppH5();
     return;
   }
   const shareGroup = config || appShareConfig;
   // params参数请参考 commonActionSheet 方法
   console.log('directShowActionSheet: ', shareGroup);
   appBridge.directShowActionSheet({
     successFunc: function() {},
     errorFunc: function(error) {
       throw error;
     },
     shareGroup,
   });
 }
 
 /**
  * 动态加载 JS
  * @param {String} url JS 文件 URL
  * @returns 返回Promise
  */
 export function dynamicLoadingJs(url) {
   return new Promise(resolve => {
     const scriptDom = document.createElement('script');
     scriptDom.type = 'text/javascript';
     scriptDom.async = false;
     scriptDom.src = url;
     scriptDom.onload = res => {
       resolve(res);
     };
     document.head.appendChild(scriptDom);
   });
 }
 
 /**
  *
  * @param {Object} config 分享信息
  * @param {String} config.title 分享标题
  * @param {String} config.link 分享链接
  * @param {String} config.imgUrl 分享图片
  * @param {String} config.desc 分享描述
  * @param {Function} config.success 分享成功回调函数
  * @param {Object} options 一些可选参数
  * @param {Boolean} options.debug 是否开启微信分享的调试模式，默认不开启
  * @param {String} options.jweixinUrl 微信 JSSDK 的 URL，默认 jweixin-1.6.0.js
  * @param {String} options.ticketLink 微信需要生成签名的链接，默认当前链接
  * @param {String} options.appId 微信设置 “JS接口安全域名” 的公众号 AppId，默认 wxe2a04a49c02b1d5d，即微易计划书公众号AppId
  * @param {Array} options.jsApiList 需要使用的 JS 接口列表。默认 ['onMenuShareTimeline', 'onMenuShareAppMessage']
  * @param {Array} options.openTagList // 需要使用的开放标签列表。默认 []
  * @param {Function} options.wxReadyCallback wx.ready 事件执行的回调函数。
  * @returns
  *
  * @example
  * wechatShare({
  *   title: '微信分享自定义标题',
  *   link: location.href,
  *   imgUrl: null,
  *   desc: '微信分享自定义描述微信分享自定义描述'
  * });
  * wechatShare({
  *   title: '微信分享自定义标题',
  *   link: location.href,
  *   imgUrl: null,
  *   desc: '微信分享自定义描述微信分享自定义描述'
  * }, {
  *   debug: true,
  *   jweixinUrl: '',
  *   ticketLink: '',
  *   appId: '',
  *   jsApiList: ['onMenuShareAppMessage'],
  *   wxReadyCallback: () => {
  *     console.log('wxReadyCallback');
  *   },
  * });
  */
 export function wechatShare(config = {}, options = {}) {
   const isWechat = /micromessenger/.test(navigator.userAgent.toLowerCase());
   if (!isWechat) {
     return;
   }
   const { title, link, imgUrl, desc, success } = config;
   const { debug, jweixinUrl, ticketLink, appId, wxReadyCallback } = options;
   return new Promise(resolve => {
     if (window.wx) {
       resolve();
       return;
     }
     dynamicLoadingJs(jweixinUrl || JWEIXIN_URL).then(() => resolve());
   }).then(() => {
     const JsApiSignatureUrl = `https://bxgjtc.wyins.net${
       IS_PRODUCT_ENV ? '' : '.cn'
     }/wx/page/createJsApiSignature`;
     const JsApiSignatureParams = {
       appId: appId || 'wxe2a04a49c02b1d5d', // 默认，微易计划书公众号AppId
       url: ticketLink || location.href,
     };
     return axios
       .get(JsApiSignatureUrl, { params: JsApiSignatureParams })
       .then(({ data }) => {
         if (!data.success) {
           return new Error(data.info);
         }
         const { appId, timestamp, nonceStr, signature, openTagList = [] } = data.data;
         const NOOP = function() {};
         const jsApiList = options.jsApiList || [
           'onMenuShareTimeline',
           'onMenuShareAppMessage',
         ];
         const jsApiListBackup = jsApiList.slice(0);
 
         wx.config({
           debug: debug || false,
           appId,      // 必填，公众号的唯一标识
           timestamp,  // 必填，生成签名的时间戳
           nonceStr,   // 必填，生成签名的随机串
           signature,  // 必填，签名，见附录1
           jsApiList,  // 需要使用的 JS 接口列表
           openTagList // 需要使用的开放标签列表
         });
         wx.ready(() => {
           if (jsApiListBackup.includes('onMenuShareTimeline')) {
             wx.onMenuShareTimeline({
               debug: debug || false,
               title, // 分享标题
               link, // 分享链接
               imgUrl, // 分享图标
               success: success || NOOP,
             });
           }
           if (jsApiListBackup.includes('onMenuShareAppMessage')) {
             wx.onMenuShareAppMessage({
               debug: debug || false,
               title, // 分享标题
               desc, // 分享描述
               link, // 分享链接
               imgUrl, // 分享图标
               success: success || NOOP,
             });
           }
           if (wxReadyCallback) {
             wxReadyCallback();
           }
         });
         wx.error(error => {
           throw error;
         });
       });
   });
 }
 
 export default { initShareAction, nativeShare, h5ButtonShare, wechatShare };
 