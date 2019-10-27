(function(global) {
    // 一些特定功能从哪个APP版本开始支持
    var FEATURE_LEAST_VERS = {
        // 自动导入联系人需要传入类型参数，默认为recepient
        AUTO_IMPORT_NEEDS_TYPE: '1.4.2',
        // '实名注册'概念废止
        REAL_NAME_REGISTER_DEPRECATED: '1.4.2',
        REGION_PICKER: '1.4.2',
        APP_PAY: '1.4.2',
        PHOTO: '1.4.2',
        NATIVE_VIEW_WORMHOLE: '1.4',
        SHARING_AWARE: '1.4',
        RECORDING: '1.4',
        ZENG_XIAN: '1.3',
        CRM_IMPORT: '1.2',
        APP_SHARE: '1.2',
        APP_VIEW: '1.2',
        H5_APP: '1.0'
    };

    // 当前APP和设备的信息
    var APP_INFO = (function(ua) {
        var appMatches = /WeiYi\/(\d(\.\d)+)\b/i.exec(ua);

        var verStr = appMatches && appMatches[1] || '';
        var isAndroid = /AndroidApp/i.test(ua);
        var isIos = /AppleApp/i.test(ua);
        var isWechat = /micromessenger/i.test(ua);

        return {
            IS_APP: !!appMatches && appMatches.length > 0,
            VER: verStr,
            IS_ANDROID: isAndroid,
            IS_IOS: isIos,
            IS_WECHAT: isWechat
        };
    })(navigator.userAgent.toLowerCase());

    var NOOP_FUNC = function() {};

    function compareVersion(verA, verB) {
        var arrA = verA.split('.'),
            arrB = verB.split('.'),
            result = 0; // 0 相等，1 大于， -1 小于

        var length = Math.max(arrA.length, arrB.length);

        for (var idx = 0; idx < length; idx++) {
            var currentA = idx < arrA.length ? parseInt(arrA[idx], 10) : 0,
                currentB = idx < arrB.length ? parseInt(arrB[idx], 10) : 0;

            result = currentA - currentB;

            if (result !== 0) {
                // 已分胜负，提前返回
                return result > 0 ? 1 : -1;
            }
        }

        return 0;
    }

    function checkAppFeature(featureName) {
        return APP_INFO.IS_APP && compareVersion(APP_INFO.VER, getFeatureVer(featureName)) >= 0;
    }

    function getFeatureVer(featureName) {
        return FEATURE_LEAST_VERS[featureName] || 0;
    }

    function getVerStr() {
        return APP_INFO.IS_WECHAT ? '非App / 微信' : !APP_INFO.IS_APP ? '非App / 浏览器' :
            ((APP_INFO.IS_IOS ? 'iOS' : '安卓') + '版App，v' + APP_INFO.VER);
    }

    function isH5App() {
        return APP_INFO.IS_APP && APP_INFO.VER == FEATURE_LEAST_VERS['H5_APP'];
    }

    function isApp() {
        return APP_INFO.IS_APP;
    }

    function isIos() {
        return APP_INFO.IS_IOS;
    }

    function isAndroid() {
        return APP_INFO.IS_ANDROID;
    }

    function isWechat() {
        return APP_INFO.IS_WECHAT;
    }
    // iOS 桥接调用，通过调用本函数间接调用原生handler，或注册JS开放给原生的接口。callback会被传入唯一参数bridge。
    //connectIosBridge(function (bridge) {
    //    //调用原生hander的例子如下：
    //    bridge.callHandler('iosHandlerName', {foo: 'bar'});
    //    //注册JS接口给原生调用的例子如下：
    //    bridge.registerHandler('jsHandlerName', someGlobalFunc);
    //});
    function connectIosBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            callback(window.WebViewJavascriptBridge)
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                callback(window.WebViewJavascriptBridge)
            }, false)
        }
    }

    // Android桥接调用。
    // JS调用原生只需直接调用window.app.androidHandlerName()
    // 注册JS接口给原生调用只需在window.androidHandler下附加类型为function的属性
    var androidBridge = window.app;
    window.androidHandler = {
        jsOnSharingDone: NOOP_FUNC,
        jsOnRecordingDone: NOOP_FUNC,
        jsOnBackToInputPage: NOOP_FUNC,
        jsUpdateContactInfo: NOOP_FUNC,
        jsPrepareAndShare: NOOP_FUNC
    };
    // 原生在页面被切出时会主动调用window.unload()，此方法历史原因其实是混淆了页面unload事件与onunload方法，试图触发unload事件但实际上仅仅调用了“自定义”方法unload()。
    // 没有声明window.unload方法的页面会抛出错误。
    window.unload = window.unload || NOOP_FUNC;

    // 兼容H5版本（1.0）App的后退和边缘滑动
    function legacyAppGoBack() {
        var backDom = document.querySelector('.return-url'),
            returnUrl = backDom && backDom.value;

        if (window.spaGoBack) {
            window.spaGoBack();
        } else if (returnUrl) {
            window.location.href = returnUrl;
        } else {
            window.history.go(-1);
        }
    }

    if (APP_INFO.IS_APP && APP_INFO.IS_IOS && !window.iosBridgeInited) {
        // 避免重复初始化，但iosBridgeInited为true并不代表bridge ready
        window.iosBridgeInited = true;
        connectIosBridge(function(bridge) {
            bridge.init(function(message, responseCallback) {
                if (message == -1) {
                    responseCallback(1);
                    legacyAppGoBack();
                }
            });
        });
    }

    function insertLegacyHeader(returnUrl) {
        if (isH5App()) {
            // CSS引用
            var cssDom = document.createElement('link');
            cssDom.type = 'text/css';
            cssDom.rel = "stylesheet";
            cssDom.href = 'http://app.winbaoxian.com/staic/css/common/legacy-header.css';
            document.querySelector('head').appendChild(cssDom);
            // Dom
            var headerDom = document.createElement('header');
            headerDom.className = 'top-float-header';
            headerDom.innerHTML = '<span class="left-back-btn" id="back-btn"></span>' +
                (returnUrl ? '<input type="hidden" class="return-url" value="' + returnUrl + '" autocomplete="off">' : '') +
                '<h1>' + document.title + '</h1>';
            headerDom.addEventListener('click', function() {
                legacyAppGoBack();
            }, false);
            document.body.insertBefore(headerDom, document.body.firstChild);
            document.body.style.marginTop = '44px';
            window.appBack = legacyAppGoBack;
        }
    }

    // 目前约定原生回调JS均传入唯一参数，类型为基本类型或map（一般Object）
    function registerJSHandler(hdlName, hdlFunc) {
        if (APP_INFO.IS_IOS) {
            connectIosBridge(function(bridge) {
                bridge.registerHandler(hdlName, hdlFunc);
            });
        } else if (APP_INFO.IS_ANDROID) {
            window.androidHandler[hdlName] = hdlFunc;
        }
    }

    // 目前约定JS调原生均传入唯一参数，类型为JSON object
    // 由于Android Javascript Interface只接受基本类型，所以对于Object做序列化。
    // 貌似Android Javascript Interface要求参数个数匹配。
    function callAppBridge(hdlName, argObj) {
        if (APP_INFO.IS_IOS) {
            connectIosBridge(function(bridge) {
                bridge.callHandler('ios' + hdlName, argObj);
            });
        } else if (APP_INFO.IS_ANDROID) {
            var primitiveArg = typeof argObj === 'object' ? JSON.stringify(argObj) : argObj;
            androidBridge && androidBridge['android' + hdlName] && (argObj == undefined ? androidBridge['android' + hdlName]() : androidBridge['android' + hdlName](primitiveArg));
        }
    }

    // 需要向后兼容的一键分享桥接
    function oneKeyShareLegacy(argObj) {
        var str = JSON.stringify(argObj);

        if (APP_INFO.IS_IOS) {
            connectIosBridge(function(bridge) {
                bridge.send(str);
            });
        } else if (APP_INFO.IS_ANDROID) {
            androidBridge && androidBridge.share && androidBridge.share(str);
        }
    }

    // 分享功能，兼容App 1.0的第三方SDK库和App 1.2的自己代码的分享库
    function share(argObj) {
        var content = argObj.content || argObj.desc || '',
            shareUrl = argObj.shareUrl || argObj.link || '#';

        if (checkAppFeature('APP_SHARE')) {
            callAppBridge('Share', {
                title: argObj.title,
                content: content,
                shareUrl: shareUrl,
                imgUrl: argObj.imgUrl,
                shareChannel: argObj.shareChannel
            });
        } else {
            oneKeyShareLegacy({
                title: argObj.title,
                desc: content,
                link: shareUrl,
                imgUrl: argObj.imgUrl,
                shareChannel: argObj.shareChannel
            });
        }
    }

    var sharingInfoGetter = NOOP_FUNC;

    function notifyShareInfo(argObj) {
        if (argObj.async) {
            if (!checkAppFeature('SHARING_AWARE')) {
                // 不支持异步分享
                return;
            }
            // 异步获取信息，流程为：JS通知原生显示分享按钮ShowShareItem（但信息待定） > 原生分享按钮被点击时调用jsPrepareAndShare() > js调用传入的argObj.infoFn准备分享信息，并使用其返回值传入share调用原生主动分享
            var currentFn = sharingInfoGetter;

            sharingInfoGetter = argObj.infoFn;

            // 如果是首次通知原生，需要调用原生API并注册回调包裹函数
            if (currentFn === NOOP_FUNC) {

                callAppBridge('ShowShareItem', {
                    async: true
                });
                registerJSHandler('jsPrepareAndShare', function() {
                    Promise.resolve(sharingInfoGetter()).then(share);
                });
            }
            // 否则，更新了sharingInfoGetter就可以了
        } else {
            if (!checkAppFeature('APP_SHARE')) {
                return;
            }
            callAppBridge('ShowShareItem', argObj);
        }
    }

    function autoPopulateRecipientInfo(type) {
        if (!checkAppFeature('CRM_IMPORT')) {
            return false;
        }
        if (checkAppFeature('AUTO_IMPORT_NEEDS_TYPE')) {
            // 1.4.2（含）以上版本添加默认类型参数
            // 注意到因为android bridge需要参数个数匹配，不能改变低版本调用者的signature
            type = type || 'recipient';
        }
        callAppBridge('AutoPopulateRecipientInfo', type);
    }

    // 参数
    // channel（bitwise）: 1-支付宝
    function pay(channel, argObj) {
        if (!checkAppFeature('APP_PAY')) {
            // 去网页版
            return;
        }
        channel = channel || 1;
        callAppBridge('Pay', {
            channel: channel,
            info: argObj
        });
    }

    var appBridge = {
        checkAppFeature: checkAppFeature,
        getFeatureVer: getFeatureVer,
        getVerStr: getVerStr,
        isH5App: isH5App,
        isApp: isApp,
        isWechat: isWechat,
        isIos: isIos,
        isAndroid: isAndroid,
        // shareChannel = ['qq_timeline', 'qq_friends', 'wechat_timeline', 'wechat_friends']
        share: share,
        importContact: checkAppFeature('CRM_IMPORT') ? callAppBridge.bind(null, 'GetContactInfo') : NOOP_FUNC,
        onContactImport: checkAppFeature('CRM_IMPORT') ? registerJSHandler.bind(null, 'jsUpdateContactInfo') : NOOP_FUNC,
        autoImportRecipient: autoPopulateRecipientInfo,
        // 目前原生实现允许动态改变分享内容，甚至可以将'同步按钮'更新成'异步按钮'或相反。
        notifyShareInfo: notifyShareInfo,
        notifyFavouriteInfo: checkAppFeature('APP_SHARE') ? callAppBridge.bind(null, 'ShowFavouriteItem') : NOOP_FUNC,
        // gotoAppView deprecated 因为历史包袱问题只能保留，其功能是gotoNativeView的子集
        gotoAppView: checkAppFeature('APP_VIEW') ? callAppBridge.bind(null, 'GotoView') : NOOP_FUNC,
        gotoNativeView: checkAppFeature('NATIVE_VIEW_WORMHOLE') ? callAppBridge.bind(null, 'GotoPrimitiveView') : NOOP_FUNC,
        onSessionLost: checkAppFeature('APP_VIEW') ? callAppBridge.bind(null, 'GotoView', 'login') : NOOP_FUNC,
        onAppBackToInputPage: checkAppFeature('APP_VIEW') ? registerJSHandler.bind(null, 'jsOnBackToInputPage') : NOOP_FUNC,
        onSharingDone: checkAppFeature('SHARING_AWARE') ? registerJSHandler.bind(null, 'jsOnSharingDone') : NOOP_FUNC,
        // 参数最长限制录制时间（秒）{maxRecordTime: int}
        recordAudio: checkAppFeature('RECORDING') ? callAppBridge.bind(null, 'RecordAudio') : NOOP_FUNC,
        // 参数function({duration: int/*秒*/, resUrl: string}}){}
        onRecordingDone: checkAppFeature('RECORDING') ? registerJSHandler.bind(null, 'jsOnRecordingDone') : NOOP_FUNC,
        insertLegacyHeader: insertLegacyHeader,
        // 参数
        // "type": 1,    (1：拍照；2、相册；3、拍照＋相册)
        // "size": {
        //     "width": 400,
        //     "height": 300
        // },
        // "isSecret": true,
        // "folderName": "head"
        getPhoto: checkAppFeature('PHOTO') ? callAppBridge.bind(null, 'GetPhoto') : NOOP_FUNC,
        // 回调得到的传入参数
        // "photoUrl": "http://www.winbaoxian.com/Images/weiyi-logo.jpg",
        // "actualSize": {
        //     "width": 401,
        //     "height": 301
        // }
        onPhotoDone: checkAppFeature('PHOTO') ? registerJSHandler.bind(null, 'jsOnPhotoDone') : NOOP_FUNC,
        pay: pay,
        onPayingDone: checkAppFeature('APP_PAY') ? registerJSHandler.bind(null, 'jsOnPayingDone') : NOOP_FUNC,
        pickRegion: checkAppFeature('REGION_PICKER') ? callAppBridge.bind(null, 'PickRegion') : NOOP_FUNC,
        // 参数
        // provId: 'code',
        // cityId: 'code',
        // countyId: 'code',
        // areaName: '浙江省杭州市西湖区'
        onRegionDone: checkAppFeature('REGION_PICKER') ? registerJSHandler.bind(null, 'jsOnRegionDone') : NOOP_FUNC
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
        define(function() {
            return appBridge;
        });
    } else if (typeof module !== 'undefined' && module['exports']) {
        module['exports'] = appBridge;
    } else if (typeof global !== 'undefined') {
        global['appBridge'] = appBridge;
    }
})(this);
