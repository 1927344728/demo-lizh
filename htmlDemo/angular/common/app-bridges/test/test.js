var appBridge = window.appBridge;

var defaultShareInfo = {
    title: "鑫福年年—国寿开门红旗舰产品",
    content: "国寿杨海涛为您设计的专属保险计划书，请查阅！保险——让生活更美好！",
    shareUrl: "http://app.winbaoxian.com/planBook/planBookResult?id=aef0861810634eeea8618634f90abbe2022&nw=1",
    imgUrl: "http://media.winbaoxian.com/static/images/planBook/companylogo/xinfuniannian.jpg"
};

// var defaultAliPayInfoStr = '_input_charset="utf-8"&body="该测试商品的详细描述"&it_b_pay="30m"&notify_url="http://notify.msp.hk/notify.htm"&out_trade_no="b6034e7664ae4195b3a3727591f29b0f"&partner="2088121922550229"&payment_type="1"&return_url="m.alipay.com"&seller_id="honghao@winbaoxian.cn"&service="mobile.securitypay.pay"&sign="18vXKUg%2FAU9DqsB2x44YorMAUTPi8cOW7j1rQ%2BKcKfRkRIW0%2Fg0I3Yj%2BmpIMmohctbj5pgmn7Lf2eKW%2BIB5BqDDRSN5e1UuRvPvyr0fpn1wSRYFcP%2F0Ajsv%2FVrhixITq9dx2O4xhIWTid3mLPgs4bDnwDkh9DuGDBkrUto%2Btbh4%3D"&sign_type="RSA"&subject="测试的商品"&total_fee="0.01"';

var VALIDATE_RULES = {
    required: /^[^\.,<>'"]+$/,
    link: /^[a-zA-z]+:\/\/[^\s]*$/,
    money: /^[0-9]+(\.[0-9]{1,2})?$/
}

var defaultInsureInfo = {
    "detailUrl": "http://test.winbaoxian.com/insure/product/feature/11",
    "insureUrl": "http://test.winbaoxian.com/insure/product/input/11",
    "productId": "11",
    "productPrice": "100.0",
    "isSoldOut": "false"
};

var TPLS = window.TPLS || {};

var apiGroups = [{
    groupId: 'sharing',
    groupDesc: '分享测试'
}, {
    groupId: 'crm',
    groupDesc: '客户信息导入测试'
}, {
    groupId: 'goto',
    groupDesc: '跳转原生页面测试'
}, {
    groupId: 'recording',
    groupDesc: '录音测试'
}, {
    groupId: 'pay',
    groupDesc: '支付测试'
}, {
    groupId: 'photo',
    groupDesc: '拍照和照片测试'
}, {
    groupId: 'regionPicker',
    groupDesc: '地址选择器测试'
}];

function notify(str) {
    new jBox('Notice', {
        content: str || ''
    });
}

function disableButtonForNotSupport(wBtn, featureName) {
    wBtn.prop('disabled', true).text(appBridge.getFeatureVer(featureName) + '版可用');
}

function prepareFrame() {
    var tpl = TPLS['testFrame'];
    var isApp = appBridge.isApp();
    if (!tpl) {
        return;
    }
    $('.testFrame').replaceWith(tpl(apiGroups));
    $('.ver-info').text(appBridge.getVerStr() + (isApp ? '' : '，请在App中测试'));
    if (isApp) {
        apiGroups.forEach(function(it) {
            var groupId = it.groupId;
            tpl = TPLS[groupId + 'Test'];
            if (!tpl) {
                return;
            }
            $('#' + groupId + ' .panel-body').append(tpl());
        });
    } else {
        $('.panel-warning').removeClass('panel-warning').addClass('panel-default');
        $('.panel-collapse.in').removeClass('in');
        $(document).off('click.bs.collapse.data-api', '[data-toggle="collapse"]');
    }
}

function prepareSharingTest() {
    var inputs = $('#sharing').find('input[type=text]');

    function autoPopulateForm() {
        inputs.each(function() {
            var wIt = $(this),
                name = wIt.attr('name');
            if (defaultShareInfo[name]) {
                wIt.val(defaultShareInfo[name]).removeClass('has-error');
            }
        });
    }

    function initInputs() {
        inputs.on('change input paste', function() {
            $(this).closest('.input-group').removeClass('has-error');
        });
        $('.share-channel-picker > button').on('click', function() {
            if (!$(this).siblings('.btn-success').size()) {
                // 如果是最后一个激活的渠道，不能取消激活
                return;
            }
            $(this).toggleClass('btn-success');
        });
    }

    function validateForm() {
        var isAllValid = true;
        inputs.each(function() {
            var wIt = $(this),
                valiType = wIt.data('validate'),
                isValid;

            isValid = VALIDATE_RULES[valiType].test(wIt.val());
            wIt.closest('.input-group').toggleClass('has-error', !isValid);
            isAllValid = isAllValid && isValid;
        });
        return isAllValid;
    }

    function getShareChannel() {
        var channels = [];
        $('.share-channel-picker > .btn-success').each(function() {
            channels.push($(this).data('channel'));
        });
        return channels;
    }

    function getFormData() {
        var data = {};
        inputs.each(function() {
            var wIt = $(this),
                name = wIt.attr('name');
            if (defaultShareInfo[name]) {
                data[name] = wIt.val();
            }
        });
        data.shareChannel = getShareChannel();
        return data;
    }

    function getShareInfo() {
        var pm = new Promise(function(resolve, reject) {
            $.ajax({
                url: 'http://test.winbaoxian.com/main/getSysTime',
                success: function(response) {
                    var dateObj = new Date(response.data);
                    resolve({
                        title: '服务器时间' + dateObj,
                        content: '微易关爱员工健康，为您实时播报杭州PM2.5指数。',
                        shareUrl: 'http://aqicn.org/city/hangzhou/',
                        imgUrl: 'http://www.winbaoxian.com/Images/PC_QR_Code_01.png',
                        shareChannel: getShareChannel()
                    });
                },
                error: function(jqXHR, statusStr, errStr) {
                    notify('网络不给力啊，再刷新一下试试。');
                    reject();
                }
            });
        });
        return pm;
    }

    initInputs();
    $('#sharing .auto-fill').on('click', autoPopulateForm);
    $('#sharing .h5-share').on('click', function() {
        if (validateForm()) {
            appBridge.share(getFormData());
        }
    });
    if (appBridge.checkAppFeature('APP_SHARE')) {
        $('#sharing .insta-share').on('click', function() {
            if (validateForm()) {
                appBridge.notifyShareInfo(getFormData());
            } else {
                return false;
            }
        });
    } else {
        disableButtonForNotSupport($('#sharing .insta-share'), 'APP_SHARE');
    }
    if (appBridge.checkAppFeature('SHARING_AWARE')) {
        $('#sharing .async-share').on('click', function() {
            if (validateForm()) {
                appBridge.notifyShareInfo({
                    async: true,
                    infoFn: getShareInfo
                });
            }
        });
        appBridge.onSharingDone(function(sharingResult) {
            notify('恭喜，分享成功：' + JSON.stringify(sharingResult));
        });
    } else {
        disableButtonForNotSupport($('#sharing .async-share'), 'SHARING_AWARE');
    }
}

function prepareCrmTest() {

}

function prepareGotoTest() {
    if (appBridge && appBridge.checkAppFeature('NATIVE_VIEW_WORMHOLE')) {
        $('.insure-list-btn').on('click', function() {
            appBridge.gotoNativeView({
                type: "sendInsureList",
                data: {}
            })
        });
        $('.insure-detail-btn').on('click', function() {
            appBridge.gotoNativeView({
                type: "sendInsureContent",
                data: defaultInsureInfo
            })
        });
        $('.get-money-btn').on('click', function() {
            appBridge.gotoNativeView({
                type: "insureProductList",
                data: {
                    insureCategory: $('.get-money-cat').val()
                }
            })
        });
    } else {
        disableButtonForNotSupport($('.insure-list-btn, .insure-detail-btn, .get-money-btn'), 'NATIVE_VIEW_WORMHOLE');
    }
}

function prepareRecordingTest() {
    if (appBridge && appBridge.checkAppFeature('RECORDING')) {
        $('.record-btn').on('click', function() {
            appBridge.recordAudio({
                maxRecordTime: 20
            });
        });
        appBridge.onRecordingDone(function(audioInfo) {
            $('.recordingDone').text(JSON.stringify(audioInfo));
            if (audioInfo.recordStatus) {
                $("<audio></audio>", {
                    "class": "audio-play",
                    controls: "controls",
                    src: audioInfo.recordUrl
                }).insertAfter('.recordingDone');
            }
        });
    } else {
        disableButtonForNotSupport($('.record-btn'), 'RECORDING');
    }
}

function preparePhotoTest() {

    var wPhotoChannelBtns = $('.photo-channel-btns > button'),
        wPhotoSizeBtns = $('.photo-option-btns > .btn-size'),
        wPhotoSecretBtn = $('.photo-option-btns > .btn-secret');

    function initBtns() {
        wPhotoChannelBtns.on('click', function() {
            if (!$(this).siblings('.btn-success').size()) {
                // 如果是最后一个激活的渠道，不能取消激活
                return;
            }
            $(this).toggleClass('btn-success');
        });
        wPhotoSizeBtns.on('click', function() {
            var wBtn = $(this);
            if (wBtn.hasClass('btn-info')) {
                return;
            } else {
                wPhotoSizeBtns.removeClass('btn-info');
                wBtn.addClass('btn-info');
            }
        });
        wPhotoSecretBtn.on('click', function() {
            $(this).toggleClass('btn-success');
        });
    }

    function onPhotoDone(photoInfo) {
        if (photoInfo && photoInfo.photoUrl) {
            photoInfo.txt = JSON.stringify(photoInfo);
            var photoItem = $(TPLS.photoItem(photoInfo));
            photoItem.find('.btn-del').one('click', function() {
                photoItem.remove();
            });
            $('.photo-list').append(photoItem);
        }
    }

    function getPhotoChannel() {
        var channels = 0;
        wPhotoChannelBtns.filter('.btn-success').each(function() {
            channels |= $(this).data('channel');
        });
        return channels;
    }

    function getPhotoSize() {
        var sizeStr = wPhotoSizeBtns.filter('.btn-info').data('size'),
            sizeArr = (sizeStr || '4_4').split('_'),
            sizeObj = {
                width: sizeArr[0] * 100,
                height: sizeArr[1] * 100
            };
        return sizeObj;
    }

    function getIsSecret() {
        return wPhotoSecretBtn.hasClass('btn-success');
    }

    initBtns();
    if (appBridge && appBridge.checkAppFeature('PHOTO')) {
        $('.photo-btn').on('click', function() {
            appBridge.getPhoto({
                type: getPhotoChannel(),
                size: getPhotoSize(),
                isSecret: getIsSecret(),
                folderName: "test"
            });
        });
        appBridge.onPhotoDone(onPhotoDone);
    } else {
        disableButtonForNotSupport($('.photo-btn'), 'PHOTO');
    }
    // debug
    window.getPhotoInfo = function() {
        console.log({
            type: getPhotoChannel(),
            size: getPhotoSize(),
            isSecret: getIsSecret(),
            folderName: "test"
        });
    };
    // debug
}

function preparePayTest() {
    var inputs = $('#pay').find('input[type=text], input[type=number]');

    function initInputs() {
        inputs.on('change input paste', function() {
            $(this).closest('.input-group').removeClass('has-error');
        });
    }

    function validateForm() {
        var isAllValid = true;
        inputs.each(function() {
            var wIt = $(this),
                valiType = wIt.data('validate'),
                isValid;

            isValid = VALIDATE_RULES[valiType].test(wIt.val());
            wIt.closest('.input-group').toggleClass('has-error', !isValid);
            isAllValid = isAllValid && isValid;
        });
        return isAllValid;
    }

    function getFormData() {
        var data = {};
        inputs.each(function() {
            var wIt = $(this),
                name = wIt.attr('name');

            data[name] = wIt.val();
        });
        data.payOrderSN = "c23f92668" + (new Date().getTime());
        data.payEnv = 'app';
        return data;
    }

    function onPayingDone(payingInfo) {
        $('.pay-result').text(JSON.stringify(payingInfo));
    }
    var payInfoStr = '',
        payInfo = {};

    if (appBridge && appBridge.checkAppFeature('APP_PAY')) {
        initInputs();
        $('.get-bill-btn').on('click', function() {
            if (!validateForm()) {
                return;
            }
            $.getJSON('http://tpay.winbaoxian.com/thirdPay/alipay/getReqStr', {
                reqStr: JSON.stringify(getFormData())
            }, function(response) {
                if (response.success) {
                    payInfoStr = response.extObject.alipayReqStr;
                    payInfo = JSON.parse('{\"' + payInfoStr.replace(/&/g, ',\"').replace(/=/g, '\":') + '}');
                    $('.pay-info').append(TPLS['jsonTableView'](payInfo));
                } else {
                    notify('生成订单失败：' + response.errorMsg);
                }
            });
        });
        $('.alipay-btn').on('click', function() {
            $('.pay-result').text('支付已发起，等待结果...（不支持或收不到回调的场景就憋等了）');
            appBridge.pay(1, payInfoStr);
        });
        appBridge.onPayingDone(onPayingDone);
    } else {
        disableButtonForNotSupport($('.alipay-btn'), 'APP_PAY');
    }
}

function prepareRegionPickerTest() {
    if (appBridge && appBridge.checkAppFeature('REGION_PICKER')) {
        $('.region-btn').on('click', function() {
            appBridge.pickRegion();
        });
        appBridge.onRegionDone(function(regionInfo) {
            $('.regionDone').text(JSON.stringify(regionInfo));
        });
    } else {
        disableButtonForNotSupport($('.region-btn'), 'REGION_PICKER');
    }
}

$(function() {
    prepareFrame();
    if (appBridge && appBridge.isApp()) {
        prepareSharingTest();
        prepareCrmTest();
        prepareGotoTest();
        prepareRecordingTest();
        preparePhotoTest();
        preparePayTest();
        prepareRegionPickerTest();
    }
});
