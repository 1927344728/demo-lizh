// initCrm要求在页面加载完成后再被调用，否则可能无法成功添加“从客户列表导入”按钮
var initCrm = function(appBridge) {

    //var contactTypeKeys = ['insurant', 'applicant', 'recipient'];
    // 2015.09.12确认只需要导入收件人，暂时屏蔽被保人和投保人
    var contactTypeKeys = ['recipient'];

    function addCrmButtons() {
        var domVer = $('.assured-info').size() ? 1 : $('.title-ctrl').size() ? 2 : 3;

        var appendBtn = function (type, w_container) {
            var w_btn = $('<span></span>', {
                'class': 'crm',
                text: '从客户列表导入',
                'data-type': type
            }).appendTo(w_container);

            if (appBridge.importContact) {
                w_btn.on('click', function () {
                    appBridge.importContact($(this).data('type'));
                });
            }
        };

        if (domVer === 3) {
            // 第三版，每个分块有单独的<header>用于放置CRM按钮
            contactTypeKeys.forEach(function (key) {
                appendBtn(key, $('.' + key + '-info header'));
            });
        } else if (domVer === 2) {
            // 第二版，投保人和被保人模块标题右侧已经被“有社保”，“本人”占据，CRM按钮放置在“性别”一行
            contactTypeKeys.forEach(function (key) {
                appendBtn(key, key === 'recipient' ? $('.' + key + '-info header') : $('.' + key + '-info ul .info-item').first());
            });
        } else {
            // 基本版，被保人模块标题右侧有可能已经被“本人”占据，CRM按钮放置在“性别”一行
            // 基本版，可能无投保人模块，大瑞鑫投保人模块在豁免险里面，较乱先统一跳过
            //var w_applicantCrmContainer = $('.assured-info .title.toubao-pos');
            //if (w_applicantCrmContainer.find('input').size()) {
            //    w_applicantCrmContainer = w_applicantCrmContainer.next();
            //}

            // 2015.09.12确认只需要导入收件人，暂时屏蔽被保人和投保人
            //appendBtn('insurant', $('.assured-info .title').first());

            // appendBtn('applicant', w_applicantCrmContainer);
            appendBtn('recipient', $('.recipient-info .title').first());

            // 收件人模块添加隐藏input用于传递客户id（第3版和第2版不需要……）
            $('.recipient-info').append($('<input>', {
                type: 'hidden',
                name: 'cid'
            }));
        }
    }

    // 选择联系人确认导入的JS回调
    function onImportCallback(data) {

        var domVer = $('.assured-info').size() ? 1 : $('.title-ctrl').size() ? 2 : 3;

        // 以下为基本版计划书的导入回调
        var ctrlNamesMap = {
                insurant: {
                    // 确保birthday在其他属性前面，这样优先使用birthday做change，否则第一代页面上age下拉框得不到更新
                    birthday: 'birthday',
                    sex: 'sex'
                },
                applicant: domVer > 1 ? {
                    birthday: 'birthday',
                    sex: 'applySex'
                } : {},
                recipient: {
                    cid: 'cid',
                    name: 'cname',
                    sex: 'csex'
                }
            }[data.type],
            w_sec = {
                insurant: domVer > 1 ? $('.insurant-info') : $('.assured-info'),
                applicant: domVer > 1 ? $('.applicant-info') : null,
                recipient: $('.recipient-info')
            }[data.type],
            calculatingTrigger; // 记录（如果必要）用来触发重算保费的控件

        if (!ctrlNamesMap || !w_sec || !w_sec.size()) {
            return;
        }

        function triggerChangeOrDelay(w_trigger) {
            if (domVer <= 1) {
                // 基本版，只有被保人信息改变时触发保费重算，且只需触发一次。
                if (data.type !== 'insurant') {
                    return;
                }
                calculatingTrigger = calculatingTrigger || w_trigger;
            } else {
                // 第二和第三版，每次改变都需要立即触发改动以更新dataModel
                // 目前CRM导入的信息除了收件人姓名外没有文本框，所有只需要触发change而不需要blur
                w_trigger.triggerHandler('change');
            }
        }

        $.each(ctrlNamesMap, function (key, ctrlName) {
            if (data[key] === undefined) {
                return true;
            } else if (key === 'birthday') {
                var birthDate = new Date(data[key]),
                    w_mobiscroll = w_sec.find('.birthday');

                w_mobiscroll.mobiscroll('setVal', birthDate.getYear() + '-' + birthDate.getMonth() + '-' + birthDate.getDate(), true, false);
                triggerChangeOrDelay(w_mobiscroll); // 会更新年龄，并间接（程序）触发年龄下拉框的change事件。
                return true;
            }

            var selector = 'input[name="' + ctrlName + '"], select[name="' + ctrlName + '"]',
                w_ctrls = $(selector),
                ctrlType = w_ctrls.attr('type');

            if (ctrlType === 'radio' || ctrlType === 'checkbox') {
                w_ctrls.each(function () {
                    var w_ctrl = $(this),
                        checked = w_ctrl.val() == data[key];

                    w_ctrl.prop('checked', checked);
                    if (ctrlType === 'checkbox' || checked) {
                        // 对于radio来说，被选中的那个按钮充当change trigger，这是为了兼容第二版和第三版投保页面的data model更新规则
                        triggerChangeOrDelay(w_ctrl);
                    }
                });
            } else {
                w_ctrls.val(data[key]);
                triggerChangeOrDelay(w_ctrls.first());
            }
        });

        // 触发保费重算，联系人不触发任何变化
        if (calculatingTrigger && calculatingTrigger.size()) {
            calculatingTrigger.triggerHandler('change');
        }
    }

        if (!appBridge || !appBridge.checkAppFeature || !appBridge.checkAppFeature('CRM_IMPORT')) {
            return;
        }
        // 添加'从客户列表导入'按钮
        addCrmButtons();
        // 绑定导入时的回调
        if (appBridge.onContactImport) {
            appBridge.onContactImport(onImportCallback);
        }
        // 页面加载完成后请求自动导入收件人
        if (appBridge.autoImportRecipient) {
            appBridge.autoImportRecipient();
        }
};