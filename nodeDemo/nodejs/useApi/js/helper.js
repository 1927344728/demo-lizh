/******************************************************************************************************************************
                                                         常用方法及主要参数 start
******************************************************************************************************************************/
window.baseApiPath = location.hostname.search(/\.winbaoxian\.com/) !== -1 ? "//app.winbaoxian.com" : "//test.winbaoxian.com";  //接口基本地址
window.globalHostName = location.hostname.search(/\.winbaoxian\.com/) !== -1 ? 'https://pbf.winbaoxian.com' : '//pbf.winbaoxian.cn'

window.allApiUrl = {  //请求接口的地址
    initInputDataApi: baseApiPath + '/planBook/V2/getInitData',
    calculateDataApi: baseApiPath + '/planBook/V2/calculate',
    queryAdvertApi: baseApiPath + '/planBook/queryAdvert',
    createPlanbookApi: baseApiPath + '/planBook/V2/uploadResult',
    saveCompareApi: baseApiPath + '/planBook/compare/save',
    getCompareApi: baseApiPath + '/planBook/compare/list',
    deleteCompareApi: baseApiPath + '/planBook/compare/delete',
};

var helperJs = {
    //函数：设置一些页面基础属性
    setBaseAttribute: function () {
        document.documentElement.style.fontSize = window.innerWidth/375*16 >=20 ? 20 : window.innerWidth/375*16 + 'px';

        if (window.devicePixelRatio && devicePixelRatio >= 2) {  //高分辨率上1px问题
            var divElem = document.createElement('div');
            divElem.style.border = '.5px solid transparent';
            document.body.appendChild(divElem);
            if (divElem.offsetHeight == 1) {
                document.querySelector('html').classList.add('hairlines');
            }
            document.body.removeChild(divElem);
        }
    },

    //函数：加载需要验证的js
    loadVerifyJs: function () {
        var helperJs = this
        var verifyPath = location.hostname.search(/192\.168|localhost/) !== -1 ? '../../../pages/common/templatev1/' : './'
        var addJsArr = [verifyPath + 'verifyRules' + helperJs.getQueryString('planbookId') + ".js"]
        addJsArr.map(function(ele){
          var myScript  = document.createElement("script");
          myScript.type = "text/javascript";
          myScript.src  = ele;
          document.body.appendChild(myScript);
        })
    },

    //函数：获取链接中的参数
    //参数：name, 需要获取的参数名
    getQueryString: function (name) {
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
    },


    //函数：根据生日记算年龄
    //参数：时间字符串
    getAgeFromBirth: function (birth) {
        var nowDate = new Date()
        var bDate   = new Date(birth)
        var age     = nowDate.getFullYear() - bDate.getFullYear()
        if (nowDate.getMonth() - bDate.getMonth() < 0 || (nowDate.getMonth() - bDate.getMonth() === 0 && nowDate.getDate() - bDate.getDate() < 0) ) {
            age --
        }
        return age
    },

    //函数：删除obj对象中数据。
    //参数：arr为需要删除的字段数组；obj删除对象
    deleteObjPro: function (arr,obj) {
        arr.map(function (elem) {
            if (elem && obj && obj[elem] !== undefined){
                delete obj[elem];
            } else {
                return false;
            }
        })
        return obj
    },

    //函数：Obj深度考贝
    //参数：target为最终返回的对象；origial为需要复制的数据源
    deepCopy: function (target, origial) {
        if( !target ){ target = {}; }
        for (var i in origial) {
            if (origial[i] !== undefined && origial[i] !== null && typeof origial[i] === 'object') {
                target[i] = (origial[i].constructor === Array) ? [] : {}
    　　　　　　　this.deepCopy(target[i], origial[i])
    　　　　 } else {
    　　　　　　　target[i] = origial[i]
    　　　　 }
    　　}
    　　return target
    },

    //函数: 过滤数组
    //参数：arr, 需要过滤的数组
    //     key, arr子元素的key
    filterArr: function (arr, key) {
        return arr && arr.filter(function (ele) {
            return ele.key == key
        })[0]
    },

    //函数：获取年龄默认值。针对被、投保人等模块。如果年龄不在取值范围内，根据选项，取第一个年龄
    getDefaultAge: function (personInfo) {
        var ageEle =  helperJs.filterArr(personInfo.eleOrderList, 'age')
        var sexEle =  helperJs.filterArr(personInfo.eleOrderList, 'sex')
        var ageOpts =  (sexEle.value == 2 && ageEle.optsF && ageEle.optsF.length) ? ageEle.optsF : ageEle.opts

        if (ageEle.value < ageOpts[0] || ageEle.value > ageOpts[1]) {
            ageEle.value = ageOpts[0]
            personInfo.birthday = ''
        }
        return personInfo
    },


    //函数: 跳转到登录页
    gotoLogin: function() {
        if (window.appBridge && appBridge.checkAppFeature('APP_VIEW')) {
            appBridge.gotoAppView('login');
        } else {
            window.location.href = baseApiPath + '/user/login?requestUrl=' + encodeURIComponent(location.href);
        }
    },

    //函数：请求投保页初始化数据
    //参数：
    getInitData: function (Vue, createVue) {
        var helperJs = this
        helperJs.vueAxios({  //初始化数据
            self: Vue.prototype,
            type: 'get',
            url: allApiUrl.initInputDataApi,
            data: {
                insuranceTypeId: helperJs.getQueryString('planbookId') * 1
            }
        }, function(res) {
            var allInitData
            if (res.data.success) {
                if (window.appBridge && appBridge.hideLoading) {
                    appBridge.hideLoading()
                }

                if (res.data.data === -1) {
                    helperJs.gotoLogin()
                    window.appBridge && appBridge.uiAlertAutoDisappear(res.data.info);
                } else {
                    document.title = res.data.data.title
                    if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')){
                        appBridge.changeWebviewTitle(document.title);
                    }

                    allInitData = helperJs.deepCopy({}, res.data.data.initData)
                    // allInitData = helperJs.deepCopy({}, allInputData)  //测试用
                    window.globalInitData = helperJs.deepCopy({}, allInitData)


                    var verifyData = helperJs.deepCopy({}, res.data.data.verifyData)  //所有产品的验证数据
                    window.verifyData = verifyData

                    helperJs.analysisInitData(allInitData, verifyData)  //解析初始化数据
                    allInitData.inputData.productGroupList.map(function (group) {  //解析限制条件
                        group.prodOrderList.map(function (prod) {
                            helperJs.analysisCondition(prod, verifyData, allInitData)
                        })
                    })
                }
            }
            if (allInitData) {
                createVue(allInitData)
            }
        }, function(res) {
            window.appBridge && appBridge.uiAlertAutoDisappear(res.message);
        });
    },


    //函数：解析初始化数据
    //参数: initData: 初始化数据
    //      verifyData: 验证条件
    analysisInitData: function (initData, verifyData) {
        var helperJs = this
        var inputData = initData.inputData

        var ageRangeBei = [ //被保人年龄范围
            [],  //男，年龄范围
            []   //女，年龄范围
        ]
        var ageRangeTou = [ //投保人年龄范围
            [],  //男，年龄范围
            []   //女，年龄范围
        ]

        if (inputData && inputData.productGroupList ) {
            inputData.productGroupList.map(function (insType) {
                insType.prodOrderList && insType.prodOrderList.map(function (prod) {
                    var common = {
                        "key": "common",
                        "eleOrderList": [],
                    };
                    var newMulInsOrderList = {};
                    prod.mulInsOrderList && prod.mulInsOrderList.map(function (ins, idx) {
                        if (verifyData && verifyData[prod.key] && verifyData[prod.key][ins.key]) {  //根据限制条件，最所有险种的年龄
                            verifyData[prod.key][ins.key].map (function (vCondi) {
                                if (!ins.huomian || ins.huomian == 'beiHuomian') {
                                    vCondi.sex == 1 ? ageRangeBei[0].push(vCondi.minAge, vCondi.maxAge) : ageRangeBei[1].push(vCondi.minAge, vCondi.maxAge)
                                } else if (ins.huomian = 'touHuomian' || ins.huomian == 'shuangHuomian') {
                                    vCondi.sex == 1 ? ageRangeTou[0].push(vCondi.minAge, vCondi.maxAge) : ageRangeTou[1].push(vCondi.minAge, vCondi.maxAge)
                                }
                            })
                        } else {
                            console.log(prod.titleName + ' -> ' + ins.name + ': 当前险种没有费率表')
                        }

                        ins.eleOrderList.map(function (ele) {  //提取公用信息
                            if (ele.common && !helperJs.filterArr(common.eleOrderList, ele.key)) {
                                common.eleOrderList.push(ele)
                                if (idx == 0) {
                                    ins.isFollowing = true
                                }
                            }
                        })

                        ins.eleOrderList = ins.eleOrderList.filter(function (ele) {  //过滤险种中的公用信息
                            return !ele.common
                        })
                    })

                    if (common.eleOrderList.length) {  //把公用信息当作一个险种，并加入到产品险种列表的第一个元素
                        prod.mulInsOrderList.splice(0, 0, common)
                    }

                    helperJs.createGroupIns(prod)  //生成险种组合数据
                })

            })

            //设置计划书年龄范围
            ageRangeBei[0] = [Math.min.apply(Math, ageRangeBei[0]), Math.max.apply(Math, ageRangeBei[0])]  //被保人 男 年龄范围的最小值、最大值
            ageRangeBei[1] = [Math.min.apply(Math, ageRangeBei[1]), Math.max.apply(Math, ageRangeBei[1])]  //被保人 女 年龄范围的最小值、最大值

            ageRangeTou[0].length && (ageRangeTou[0] = [Math.min.apply(Math, ageRangeTou[0]), Math.max.apply(Math, ageRangeTou[0])])  //投保人 男 年龄范围的最小值、最大值
            ageRangeTou[0].length && (ageRangeTou[1] = [Math.min.apply(Math, ageRangeTou[1]), Math.max.apply(Math, ageRangeTou[1])])  //投保人 女 年龄范围的最小值、最大值
            if (inputData.personData && inputData.personData.personOrderList) {
                inputData.personData.personOrderList.map(function (person) {
                    if (person.key == 'insuredInfo') { //设置计划书中被保人年龄范围
                        helperJs.filterArr(person.eleOrderList, 'age').opts = ageRangeBei[0]
                        if (ageRangeBei[0].join() != ageRangeBei[1].join()) {
                            helperJs.filterArr(person.eleOrderList, 'age').optsF = ageRangeBei[1]
                        }
                    }else if (person.key == 'applicantInfo' && ageRangeTou[0].length) { //设置计划书中投保人年龄范围
                        helperJs.filterArr(person.eleOrderList, 'age').opts = ageRangeTou[0]
                        if (ageRangeTou[0].join() != ageRangeTou[1].join()) {
                            helperJs.filterArr(person.eleOrderList, 'age').optsF = ageRangeTou[1]
                        }
                    }
                    helperJs.getDefaultAge(person)  //取年龄默认值
                })
            }
        }

        return initData;
    },


    //函数：生成一个由多个险种组成的险种组合
    //prodData: 产品的数据
    createGroupIns: function(prodData) {
        var helperJs = this
        if (prodData.mulInsOrderList && prodData.mulInsOrderList.length) {
            prodData.mulInsOrderList = prodData.mulInsOrderList.filter(function (ins) {  //清空险种列表中的险种组合
                return !ins.isGroup
            })

            var newMulInsOrderList = {};
            prodData.mulInsOrderList.map(function (ins, idx) {
                if (ins.groupKey) {  //多险种选一，或多险种选多。生成一个组合，如多个险种合成豁免险

                    // ins.isCheckbox = false
                    newMulInsOrderList[ins.groupKey] = newMulInsOrderList[ins.groupKey] || {
                        key: ins.groupKey,
                        name: ins.groupName,
                        isGroup: true,
                        eleOrderList: [
                            {
                                "key": "title",
                                "value": false,
                                "isDisabled": false,
                                "componentName": "cmCommonTitle",  //险种标题组件。
                                "labelName": ins.groupName,  //险种标题
                            }, {
                                "key": "insuranceId",
                                "value": ins.isCheckbox ? [ins.key] : ins.key,
                                "componentName": ins.isCheckbox ? "cmCommonCheckbox" : "cmCommonRadio",
                                "opts": []
                            }
                        ]
                    }
                    var eleTitle = helperJs.filterArr(ins.eleOrderList, "title")  //当前险种标题
                    newMulInsOrderList[ins.groupKey].eleOrderList.filter(function (ele) { return ele.key == "insuranceId"})[0].opts.push({  //当险种转换成险种组合的选项
                        val: ins.key,
                        desc: eleTitle.labelName,
                        isDisabled: eleTitle.isDisabled,
                    })

                    eleTitle.value && (helperJs.filterArr(newMulInsOrderList[ins.groupKey].eleOrderList, 'title').value = eleTitle.value)
                }
            })

            for (var k in newMulInsOrderList) {  //把多个险种组合成一个险种，并加入到产品险种列表中
                var eleTitle = helperJs.filterArr(newMulInsOrderList[k].eleOrderList, 'title')
                var eleInsuranceId = helperJs.filterArr(newMulInsOrderList[k].eleOrderList, 'insuranceId')
                if (eleInsuranceId) {
                    if (eleInsuranceId.opts.filter(function (opt) { return opt.val == eleInsuranceId.value }).isDisabled) {  //设置险种单选框组件的默认值
                        eleInsuranceId.opts.some(function (opt) {
                            if (!opt.isDisabled) {
                                eleInsuranceId.value = ins.isCheckbox ? [opt.val] : opt.val
                            }
                            return !opt.isDisabled
                        })
                    }
                    eleTitle.isDisabled = eleInsuranceId.opts.every(function (opt) {
                        return !!opt.isDisabled
                    })

                    var checkedIns = helperJs.filterArr(prodData.mulInsOrderList, eleInsuranceId.value)  //当前选中险种
                    for (var ck in checkedIns) {  //将当前选中险种的部分数据复制到组合险中
                        if (['code', 'groupKey', 'groupName', 'isFollowing', 'key', 'name'].indexOf(ck) === -1) {
                            if (ck == 'eleOrderList') {
                                newMulInsOrderList[k][ck] = newMulInsOrderList[k][ck].concat(checkedIns[ck].filter(function (ele) { return ele.key != 'title'}))
                            } else {
                                newMulInsOrderList[k][ck] = checkedIns[ck]
                            }
                        }
                    }
                }
                prodData.mulInsOrderList.push(newMulInsOrderList[k])
            }
        }
    },


    //函数: 解析数据，获取保险期间，缴期期间等。以产品为单位
    //参数:
    analysisCondition: function (prodData, conditionData, initData) {
        var helperJs = this
        if (!prodData || !conditionData) { return; }
        var ageRangeProd = [
            [], //产品年龄范围，男
            [] //产品年龄范围，男
        ]
        if (conditionData[prodData.key]) {
            var personData = self && helperJs.convertProductData(initData).personData  //关于人的信息
            prodData.mulInsOrderList.map(function (insurance, iIdx, mulIns) {
                var insuranceCondi = conditionData[prodData.key] && conditionData[prodData.key][insurance.key]  //当前险种的限制条件
                if (insuranceCondi) {
                    if (!insurance.huomian || insurance.huomian == 'beiHuomian' ) {  //产品年龄范围取各险种最大范围
                        insuranceCondi.map(function (insCondi) {
                            insCondi.sex == 1 ? ageRangeProd[0].push(insCondi.minAge, insCondi.maxAge) : ageRangeProd[1].push(insCondi.minAge, insCondi.maxAge)
                        })
                    }

                    var isTouHuomian = insurance.huomian == 'touHuomian' || insurance.huomian == 'shuangHuomian'
                    var curPersonData
                    if (personData) {   //关于人的信息
                        var personType = isTouHuomian ? 'applicantInfo' : 'insuredInfo'
                        if (isTouHuomian && insurance.allowSamePerson) {    //如果险种可以附加被保人，也可以附加投保人。选中投保人，则附加到投保人
                            personType = helperJs.filterArr(personData.personOrderList, 'applicantInfo').title ? 'applicantInfo' : 'insuredInfo'
                        }
                        curPersonData = helperJs.filterArr(personData.personOrderList, personType)
                    }

                    if (curPersonData) {
                        insuranceCondi = conditionData[prodData.key][insurance.key].filter(function (condIns) {    //对应性别、年龄下的限制条件
                            return condIns.sex == curPersonData.sex && (curPersonData.age >= condIns.minAge && curPersonData.age <= condIns.maxAge)
                        })[0]
                        insuranceCondi && (insuranceCondi = insuranceCondi.conditionData)  //当前险种的限制条件

                        if (insuranceCondi && isTouHuomian && insurance.allowSamePerson && insuranceCondi.key === 'samePerson') {    //如果险种可以附加被保人，也可以附加投保人。选中投保人，则附加到投保人
                            var applicantTitle = helperJs.filterArr(personData.personOrderList, 'applicantInfo').title  //投保人是否选中
                            insuranceCondi = insuranceCondi.samePerson.filter(function (condi) {
                                return condi.value == (applicantTitle ? 0 : 1)
                            })
                            insuranceCondi && (insuranceCondi = insuranceCondi[0])
                        }
                    }

                    var eleTitle = helperJs.filterArr(insurance.eleOrderList, 'title')
                    if (!insurance.required) {  //必需产品，不做验证
                        eleTitle.isDisabled = !insuranceCondi || (isTouHuomian && !insurance.allowSamePerson && !curPersonData.title)  //如果险种不存在费率限制条件或者投保人豁免在没有选中投保人信息的条件下，险种不可选
                    }

                    var curEleCondi //储存当前元素限制条件。以便下一个限制条件回归调用
                    while (insuranceCondi && insuranceCondi.key && insuranceCondi[insuranceCondi.key]) {  //遍历当前险种的限制条件
                        var eleCondi = insuranceCondi[insuranceCondi.key]
                        var eleData = helperJs.filterArr(insurance.eleOrderList, insuranceCondi.key)
                        if (!eleData && helperJs.filterArr(prodData.mulInsOrderList, 'common')) {
                            eleData = helperJs.filterArr(helperJs.filterArr(prodData.mulInsOrderList, 'common').eleOrderList, insuranceCondi.key)
                        }

                        if (eleData) {
                            if (eleData.isHide && !eleData.isDisabled && insurance.refInsuranceId && insurance.refInsuranceId != -2) {
                                var refInsData     //数据取值来源的险种
                                if (insurance.refInsuranceId == -1) {
                                    refInsData = mulIns[0].key == 'common' ? mulIns[1] : mulIns[0]
                                } else {
                                    refInsData = helperJs.filterArr(mulIns, insurance.refInsuranceId)
                                }

                                var refEleData = refInsData && helperJs.filterArr(refInsData.eleOrderList, eleData.key)  //数据取值来源的元素
                                if (refEleData) {
                                    if (insurance.huomian && eleData.key == 'pPeriod') {    //附加险，缴费期间需要减去某个值
                                        if (refEleData.value == 'a999' || refEleData.value == 'a1000') {  //a999: 终身; a1000: 趸交
                                            eleData.value = refEleData.value
                                        }else if (refEleData.value.search(/^b/) !== -1) {  //b开头：XXX 年
                                            eleData.value = 'b' + (refEleData.value.replace(/[^0-9]/,"") * 1 - (insurance.pMinus || 0))
                                        }else if (refEleData.value.search(/^a/) !== -1) {   //a开头：至XXX岁
                                            eleData.value = 'b' + (refEleData.value.replace(/[^0-9]/,"") * 1 - curPersonData.age - (insurance.pMinus || 0))
                                        }
                                    } else {
                                        eleData.value = refEleData.value
                                    }
                                }
                                if (helperJs.filterArr(refInsData.eleOrderList, 'title').isDisabled) {
                                    eleTitle.isDisabled = true
                                }
                            } else {
                                // if (!eleData.opts || !eleData.opts.length) {   //解析当前限制条件，如果元素没有选项，生成对应选项
                                    eleData.opts = []
                                    eleCondi.map(function (condIns) {
                                        if (condIns.value !== undefined && condIns.desc !== undefined) {
                                            eleData.opts.push({
                                                val: condIns.value,
                                                desc: condIns.desc
                                            })
                                        }
                                    })
                                // }

                                if (eleData.opts && !eleData.opts.length) {     //管理对应选项。为空删除。有值则设置默认值
                                    delete eleData.opts
                                } else if (eleData.opts.every(function (ele) { return ele.val != eleData.value })) {
                                    eleData.value = eleData.opts[0].val
                                }
                            }
                        }

                        insuranceCondi = eleCondi.filter(function (condIns) {   //提定下一个元素的限制条件
                            if (!eleData) {
                                console.log("元素不存在：", condIns)
                            }
                            return eleData && condIns.value == eleData.value
                        })[0]

                        if (!insuranceCondi && curEleCondi) {  //如果当前条件下，下一个条件不符合。则选择别一个条件
                            curEleCondi.map(function (preCondi) {
                                if (!insuranceCondi && preCondi[eleData.key].some( function (curCondi) {
                                    return curCondi.value == eleData.value
                                })) {
                                    insuranceCondi = preCondi[eleData.key]
                                    var index
                                    insurance.eleOrderList.map(function (curEle, idx) {
                                        curEle.key == eleData.key && (index = idx)
                                    })
                                    insurance.eleOrderList[index - 1].value = preCondi.value
                                }
                            })
                        }

                        curEleCondi = eleCondi  //储存当前元素限制条件，用于下一条件回归调用
                        if (!insurance.required) {
                            eleTitle.isDisabled = !insuranceCondi || (isTouHuomian && !insurance.allowSamePerson && !curPersonData.title)  //如果险种不存在费率限制条件或者投保人豁免在没有选中投保人信息的条件下，险种不可选
                        }
                    }

                    if (insurance.huomian == 'shuangHuomian') {  //豁免险
                        var eleIsShuangHuomian = helperJs.filterArr(insurance.eleOrderList, 'isShuangHuomian')  //豁免险中有双豁免
                        if (eleIsShuangHuomian) { //添加双豁免的限制
                            curPersonData = helperJs.filterArr(personData.personOrderList, 'spouseInfo')    //投保人配偶信息
                            if (curPersonData) {
                                var insuranceCondi = conditionData[prodData.key][insurance.key].filter(function (condIns) {  //当前险种的限制条件
                                    return condIns.sex == curPersonData.sex && (curPersonData.age >= condIns.minAge && curPersonData.age <= condIns.maxAge)
                                })[0]
                                insuranceCondi && (insuranceCondi = insuranceCondi.conditionData)

                                if (!insuranceCondi || !curPersonData || !curPersonData.title) {    //有限制条件，且选中投保人配偶，则双豁免可选
                                    eleIsShuangHuomian.isDisabled = true
                                    eleIsShuangHuomian.value = false
                                } else {
                                    eleIsShuangHuomian.isDisabled = false
                                }
                            }
                        }
                    }

                    if (eleTitle.isDisabled) {
                        console.log( eleTitle.labelName + '-' + insurance.key + ': 没有费率，不可选')
                    }
                }
            })

            // helperJs.createGroupIns(prodData)  //生成险种组合数据

            var insuredData = helperJs.filterArr(personData.personOrderList, 'insuredInfo') //不符合性别、年龄条件，隐藏产品
            ageRangeProd[0] = [Math.min.apply(Math, ageRangeProd[0]), Math.max.apply(Math, ageRangeProd[0])]  //被保人 女 年龄范围的最小值、最大值
            ageRangeProd[1] = [Math.min.apply(Math, ageRangeProd[1]), Math.max.apply(Math, ageRangeProd[1])]  //被保人 女 年龄范围的最小值、最大值
            if (insuredData.age < ageRangeProd[insuredData.sex - 1][0] || insuredData.age > ageRangeProd[insuredData.sex - 1][1]) {
                prodData.hide = true
                prodData.totalBaof = 0
            } else {
                prodData.hide = false
            }
        }
    },



    //函数: 从原数据中，提取计算数据
    //参数: insData: 需转换的险种数据
    convertCalData: function (insData) {  //insData: 需转换的险种数据
        var resData = {}
        for (var k in insData) {
            if (k == 'eleOrderList') {
                insData[k].map(function (ele) {
                    resData[ele.key] = ele.value
                })
            } else {
                resData[k] = insData[k]
            }
        }
        return resData
    },


    //函数：计算产品数据的转换 (单个产品，包括个人信息数据)
    //参数：self，实例对象
    //     prodData, 产品数据
    convertProductData: function (self, prodData) {
        var helperJs = this
        var resData = {}  //返回数据
        var personData = {
            personOrderList: [],
            recipientInfo: {}
        }
        if (self.inputData && self.inputData.personData) {
            if (self.inputData.personData.recipientInfo) {  //转换收件人信息
                personData.recipientInfo = helperJs.convertCalData(self.inputData.personData.recipientInfo)
            }
            if (self.inputData.personData.personOrderList) {  //转换被、投、投保人配偶的信息
                var personInsured = helperJs.filterArr(self.inputData.personData.personOrderList, 'insuredInfo')
                var personApplicant = helperJs.filterArr(self.inputData.personData.personOrderList, 'applicantInfo')
                if (personApplicant) {  //关于被保人、投保人是否是同一人的处理
                    var personInsuredAge = helperJs.filterArr(personInsured.eleOrderList, 'age')
                    var personInsuredSex = helperJs.filterArr(personInsured.eleOrderList, 'sex')

                    var ageRange = (personInsuredSex.value == 2 && personInsuredAge.optsF && personInsuredAge.optsF.length) ? personInsuredAge.optsF : personInsuredAge.opts  //男女年龄范围不同
                    if (personInsuredAge.value < ageRange[0] || personInsuredAge.value > ageRange[1]) {
                        personInsuredAge.value = ageRange[0]
                    }

                    var personApplicantAge = helperJs.filterArr(personApplicant.eleOrderList, 'age')
                    var personApplicantTitle = helperJs.filterArr(personApplicant.eleOrderList, 'title')

                    if (personInsuredAge.value >= personApplicantAge.opts[0] && personInsuredAge.value <= personApplicantAge.opts[1]) {
                        personApplicantTitle.isDisabled = false
                    } else { //被保人所选年龄不在投保人年龄范围内，强制选中投保人
                        personInsured.eleOrderList.map(function (ele) {
                            if (ele.key == 'title') {
                                personApplicantTitle.value = true
                                personApplicantTitle.isDisabled = true
                            }
                        })
                    }
                    helperJs.getDefaultAge(personApplicant)  //设置投保人年龄默认值
                }

                self.inputData.personData.personOrderList.map(function (person) {
                    personData.personOrderList.push( helperJs.convertCalData(person) )
                })
            }
            resData.personData = personData
        }


        var productData = {
            key: prodData && prodData.key,
            totalBaof: prodData && prodData.totalBaof,
            common: {},
            mulInsOrderList: []
        }
        if (prodData) {
            prodData.mulInsOrderList.map(function (insurance, idx) {
                var insuranceData = helperJs.convertCalData(insurance)
                if (insuranceData.key == 'common') {
                    productData.common = insuranceData
                } else if (insuranceData.title && !insuranceData.groupKey) {
                    if (insuranceData.isGroup) {
                        var insuranceId = insuranceData.insuranceId.constructor == Array ? insuranceData.insuranceId : [insuranceData.insuranceId]
                        insuranceId.map(function (insId) {
                            var checkedIns = helperJs.filterArr(prodData.mulInsOrderList, insId)  //获取选中的险种
                            var checkedInsData = helperJs.convertCalData(checkedIns)  //获取选中的险种
                            insurance.eleOrderList.map(function (ele) {
                                if (ele.key != 'title' && ele.key != 'insuranceId') {
                                    checkedInsData[ele.key] = insuranceData[ele.key]
                                }
                            })
                            productData.mulInsOrderList.push(helperJs.deepCopy({}, checkedInsData))
                        })
                    } else {
                        productData.mulInsOrderList.push(insuranceData)
                    }
                }
            })
            resData.productData = productData
        }

        return resData
    },

    //函数：接收计算结果 (单个产品)
    //参数：self，实例对象
    //     relate, 当前产品[产品组名称, 产品名称]
    //     prodData, 产品数据
    receiveProductData: function (self, relate,  prodData) {
        var helperJs = this
        var productGroup = helperJs.filterArr(self.inputData.productGroupList, relate[0])  //现有的产品数据
        var productData  = helperJs.filterArr(productGroup.prodOrderList, relate[1])  //现有的产品数据

        prodData.mulInsOrderList.map(function (ins, idx) {
            var insuranceData = helperJs.filterArr(productData.mulInsOrderList, ins.key)  //现有的险种数据
            for (var k in ins) {  //将返回来的险种数据，赋值到现在数据中
                if (helperJs.filterArr(insuranceData.eleOrderList, k)) {
                    insuranceData.eleOrderList.map(function (myEle) {
                        if (ins[myEle.key] !== undefined) {
                            myEle.value = ins[myEle.key]
                        }
                    })
                } else {
                    insuranceData[k] = ins[k]
                }
            }
        })
        productData.mulInsOrderList.map(function (myIns) {
            if (myIns.isGroup) {
                var groupInsData = helperJs.convertCalData(myIns)
                var insuranceId = groupInsData.isCheckbox ? groupInsData.insuranceId[0] : groupInsData.insuranceId
                var checkedIns = helperJs.filterArr(productData.mulInsOrderList, insuranceId)
                for (var key in checkedIns) {
                    if (['allowSamePerson', 'code', 'eleOrderList', 'groupKey', 'groupName', 'huomian', 'key', 'name'].indexOf(key) === -1) {
                        myIns[key] = checkedIns[key]
                    }
                }
            }
        })

        self.$set(productData, 'hadChoice', true)  //该产品已经选中
        self.$set(productData, 'totalBaof', prodData.totalBaof)  //该产品已经选中

        var insShowArr
        if (prodData.insShowArr) {  //组合表格中数据
            insShowArr = prodData.insShowArr
        } else if (prodData.mulInsOrderList.length) {
            insShowArr = [['险种', '保额', '保费', '交费期间']]
            prodData.mulInsOrderList.map(function (ins) {
                insShowArr.push([ins.name, ins.baoeDesc || '-', ins.baofDesc || '-', ins.pPeriodDesc])
            })
        }
        insShowArr && (self.$set(productData, 'insShowArr', insShowArr))

        return productData
    },


    //函数: 封装vue的axios请求
    //参数：obj: 全局变量Vue, successFn: 请求成功的回调函数, failFn: 请求失败的回调函数
    // obj: {
    //     self, //vue实例
    //     type: 'get',  //请求类型 post | get。不传，默认post
    //     url: apiBasePath + '/common/insuranceCategory',  //请求地址
    //     data, //请求数据
    // }
    vueAxios: function (obj, successFn, failFn ) {
        var vueAxios = obj.self.$axios.create();
        var axiosPromise;
        if (window.appBridge && appBridge.showLoading) {
            appBridge.showLoading()
        }
        if( obj.type == 'get' ) {
            if (obj.data) {
                obj.options = obj.options || {};
                obj.options.params = obj.data;
            }
            axiosPromise = obj.self.$axios.get(obj.url, obj.options);
        }else{
            axiosPromise = obj.self.$axios.post(obj.url, obj.data || "", obj.options);
        }
        axiosPromise.then(function (res) {
            successFn && successFn(res)
            if (window.appBridge && appBridge.hideLoading) {
                appBridge.hideLoading()
            }
        }).catch(function (res) {
            console.log(res)
            if (res && res.response){
                obj.self && window.appBridge && appBridge.uiAlertAutoDisappear && window.appBridge && appBridge.uiAlertAutoDisappear("请求错误:" + res.response.statusText);
            }
            failFn && failFn(res)

            if (window.appBridge && appBridge.hideLoading) {
                appBridge.hideLoading()
            }
        })
    },

    /*初始化验证规则*/
    initValidateRules: function (self) {
        var validate = {}

        if (self.eleData.componentName == 'cmCommonInput') {
            validate.required = {
                rule: self.eleData.required !== undefined ? self.eleData.required : true,
                initial: 'off',
                message: '请输入值'
            }
            validate.regExp = {
                rule: self.eleData.regExp ? eval(self.eleData.regExp) : /^\d*$/,
                initial: 'off',
                message: "输入不合法，请重新输入",
                validator: function (value, rule) { return !value || rule.test(value) }
            }
        }
        if (self.eleData.min !== undefined && !isNaN(self.eleData.min)) {
          validate.min = {
            rule: self.eleData.min,
            initial: 'off',
            message: '请输入最小值不小于' + this.getUnitWan(self.eleData.min)
          }
        }
        if (self.eleData.max !== undefined && !isNaN(self.eleData.max)) {
          validate.max = {
            rule: self.eleData.max,
            initial: 'off',
            message: '请输入最大值不大于' + this.getUnitWan(self.eleData.max)
          }
        }
        if (self.eleData.multi !== undefined && !isNaN(self.eleData.multi)) {
          validate.multi = {
            rule: self.eleData.multi,
            initial: 'off',
            message: '请输入' + self.eleData.multi + '倍数',
            validator: function(value, rule){
                return !value || !rule || !(value%rule);
            }
          }
        }
        if (self.eleData.compareItem !== undefined) {
            validate.compare = {
                rule: [],
                initial: 'off',
                message: self.eleData.compareItem[3],
                compareItem: self.eleData.compareItem,
                validator: function (value, rule, opt) {
                    var boole
                    switch(rule[1]){
                        case "<=":
                            boole = rule[0] <= rule[2];
                            break;
                        case ">=":
                            boole = rule[0] >= rule[2];
                            break;
                        case "<":
                            boole = rule[0] < rule[2];
                            break;
                        case ">":
                            boole = rule[0] > rule[2];
                            break;
                        default:
                            boole = rule[0] <= rule[2];
                    }
                    return !rule[0] || !rule[2] || boole;
                }
            }
        }
        return validate
    },

    /* 下为收集需要验证的组件数组。vm: 是大的组件模块，即收集vm及其子组件中需要验证的组件；vmArr是收集的需验证的组件*/
    collectValidateVm: function (vm, vmArr) {
        var me = this
        if (vm.validate) { vmArr.push(vm) }
        if (vm.$children) {
            vm.$children.map(function (ele) {
                me.collectValidateVm(ele, vmArr)
            })
        }
        return vmArr
    },
    /* 验证组件 item: 起始数组元素，如0; vmArr：需要验证的组件; me: 当前需要验证的大组件模块; successFn: 验证成功执行的函数; faileFn: 验证失败执行的函数*/
    validateAllFn: function (item, vmArr, me, successFn, faileFn) {
        var self = this
        if (!vmArr || !vmArr.length) {
            successFn && successFn()
        }
        if (item >= vmArr.length) {
            return;
        }
        if (vmArr[item] && vmArr[item].validate) {
            for (var k in vmArr[item].validate) {
                if (vmArr[item].validate[k] && vmArr[item].validate[k].compareItem && vmArr[item].validate[k].compareItem.length) {
                    var valArr = vmArr[item].validate[k].compareItem
                    var productData0 = me.productData.mulInsOrderList.filter(function(ele) {
                        return ele.key == valArr[0].split('.')[0]
                    })[0]
                    var productData1 = me.productData.mulInsOrderList.filter(function(ele) {
                        return ele.key == valArr[2].split('.')[0]
                    })[0]
                    vmArr[item].validate[k].rule = [
                        productData0 && productData0.title?productData0[valArr[0].split('.')[1]] * 1:0,
                        valArr[1],
                        productData1 && productData1.title?productData1[valArr[2].split('.')[1]] * 1:0
                    ]
                }
            }
        }

        vmArr[item].$validate().then(function ($validation){
            if (item === vmArr.length - 1) {
                successFn && successFn()
            }
            $validation.fields[0].$el.querySelector('select, input').style.removeProperty("border-color");
            self.validateAllFn(item + 1, vmArr, me, successFn, faileFn)
        }).catch(function ($validation) {
            if ($validation.fields) {
                $validation.fields[0].$el.querySelector('select, input').style.borderColor = "#F04848";
                $validation.fields[0].$el.querySelector('select, input').scrollIntoView()
            }
            faileFn && faileFn($validation)
        })
    },


    /*将大于10000且是10000的整倍数的值，转为以万为单位的值*/
    getUnitWan: function (value) {
        return value >= 10000 && !(value % 10000) ? value/10000 + '万' : value
    },

    myMixin: {
    }
};
window.helperJs = helperJs;
window.gPlanbookId = helperJs.getQueryString('planbookId') * 1;  //计划书ID
/******************************************************************************************************************************
                                                         常用方法及主要参数 end
******************************************************************************************************************************/

