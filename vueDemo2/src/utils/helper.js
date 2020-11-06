import Axios from 'axios'
import qs from 'qs'
import {
    baseApiPath,
    allApiUrl,

    planbookId,
    pBType,
    crmId,
    isPreview,
    resultUuid,
    schemeUuid,
    storageUuid

} from '@/utils/index'
import { createMd5Token } from './md5Token.js'


var positionTop = 0
var helperJs = {
    // uiAlertAutoDisappear: function (msg) {  //通用弹框封装
    //     window.appBridge && appBridge.uiAlertAutoDisappear && appBridge.uiAlertAutoDisappear(msg);
    // },

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
    fixedViewportOffset: function () {
        //IOS 12以上，(app4.6.0或者 app.4.8及以上版本)或者(微信)中元素错位问题
        var iosVersion = navigator.userAgent.toLowerCase().match(/cpu iphone os ((\d*)_(.*)?) like mac os/)
        if (iosVersion && iosVersion[2] && iosVersion[2] >= 12) {
            var appVersion = appBridge.isApp() && /weiyi\/((\d+)(\.(\d+))?(\.(\d+))?)?\s/ig.exec(navigator.userAgent.toLowerCase());  //版本升级提示
            if ((appVersion && ((appVersion[2] == 4 && (appVersion[4] == 6 || appVersion[4] >= 8)) || appVersion[2] >= 5)) || appBridge.isWechat()
            ) {
                document.body.addEventListener('blur', function (e) {
                    if (["TEXTAREA", "INPUT", "SELECT"].indexOf(e.target.tagName) !== -1) {
                        setTimeout( function () {
                            window.scrollTo(0 ,document.documentElement.scrollTop || document.body.scrollTop);
                        }, 100)
                    }
                }, true)
            }
        }
    },

    //函数：动态加载需要验证器的js
    loadVerifyJs: function (iData) {
        var helperJs = this
        var addJsArr = []
        if (iData && iData.initData && iData.initData.inputData.commonData.withVerify) {
            addJsArr.push('//res.winbaoxian.com/planbookVerify/verifyRules' + helperJs.getUrlParam('planbookId') + '.js')
        }
        if (location.hostname.search(/192\.168|localhost/) !== -1 && iData.initData.inputData.commonData.withVerify) {  //测试环境中，加载计划书、产品、险种对应的验证器
            addJsArr.push('../../verifyJs/planbook/commonVerify.js')
            addJsArr.push('../../verifyJs/planbook/verifyRules' + helperJs.getUrlParam('planbookId') + ".js")
            iData.initData.inputData.productGroupList.map(function (group, gi) {
                group.prodOrderList.map(function (prod, pi) {
                    addJsArr.push('../../verifyJs/product/prodRule' + prod.key + ".js")
                    prod.mulInsOrderList.map(function (ins, ii) {
                        addJsArr.push('../../verifyJs/insurance/insRule' + ins.key + ".js")
                    })
                })
            })
        }

        addJsArr.length && addJsArr.map(function(ele){
            var myScript  = document.createElement("script");
            myScript.type = "text/javascript";
            myScript.async = true;
            myScript.src  = ele;
            document.body.insertBefore(myScript, document.scripts[document.scripts.length - 1])
        })
    },

    //函数：获取链接中的参数
    //参数：name, 需要获取的参数名
    getUrlParam: function(name, url) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(url ? url : location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },


    //函数：根据生日记算年龄
    //参数：birth为时间字符串或时间翟；aDate为指定时间，不传默认为当前时间
    getAgeFromBirth: function (birth, aDate) {
        var nowDate = aDate? (new Date(aDate)) : (new Date())
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


    //函数：判断对象深层属性是否存在
    isObjExist: function(obj, sArr) {
        return sArr.reduce(function (nObj, s) {
            return nObj && nObj[s] ? nObj[s] : null
        }, obj)
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
            if (baseApiPath == "//planbook-uat.winbaoxian.cn") {
                window.location.href = '//pbf-uat.winbaoxian.cn/planBook/tools/login/pages/login.html?requestUrl=' + encodeURIComponent(location.href);
            } else {
                window.location.href = baseApiPath + '/user/login?requestUrl=' + encodeURIComponent(location.href);
            }
        }
    },

    //函数：请求投保页初始化数据
    //参数：
    getInitData: function (Vue, createVue) {
        helperJs.vueAxios({  //初始化数据
            self: Vue.prototype,
            type: 'get',
            url: allApiUrl.initInputDataApi,
            data: {
                insuranceTypeId: planbookId
            }
        }, function(res) {
            var allResponseData
            if (res.data.success && res.data.data) {
                allResponseData = res.data.data
            }
            if (window.isDebug) {  //isDebug，采用测试用数据
                allResponseData = testInputData
                alert('当前为测试数据，前端调试用');
            }
            if (allResponseData) {

                document.title = allResponseData.title  //更新页面标题
                if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')){
                    appBridge.changeWebviewTitle(document.title);
                }
                allResponseData.companyId && (allResponseData.initData.companyId = allResponseData.companyId )
                allResponseData.userCompnayId && (allResponseData.initData.userCompnayId = allResponseData.userCompnayId )
                allResponseData.initData.saleStatus = allResponseData.saleStatus

                /**
                 * @Author   Lizh
                 * @DateTime 2019-07-01
                 * 新增投被保人是否为同一人选项
                 */
                if ((!pBType || pBType === 'video' || pBType === 'record') && allResponseData.initData.inputData.personData && allResponseData.initData.inputData.personData.personOrderList) {
                    var personOrderList = allResponseData.initData.inputData.personData.personOrderList
                    personOrderList.map(function (person) {
                        if (person.key === 'applicantInfo') {
                            person.eleOrderList.splice(1, 0, {
                                key: 'applicantAndInsuredSame',
                                value: 0,
                                labelName: '投被保人是同一人',
                                componentName: 'cmInfoRadio',
                                opts: [
                                    { val: 0, desc: '否' },
                                    { val: 1, desc: '是' }
                                ]
                            })
                        }
                    })
                }

                if (pBType) {
                    helperJs.changeInitData(allResponseData, Vue, function () {
                        helperJs.getInitDataFromResult(allResponseData, Vue, function () {
                            helperJs.initStart(allResponseData, createVue)
                        })
                    })
                } else {
                    helperJs.getInitDataFromResult(allResponseData, Vue, function () {
                        helperJs.initStart(allResponseData, createVue)
                    })
                }
            }
        });
    },

    //函数：开始实始化
    initStart: function (allResponseData, createVue) {
        helperJs.loadVerifyJs(allResponseData)

        var allInitData = helperJs.deepCopy({}, allResponseData.initData) //计划书初始化数据
        if (!allInitData.popupData) {  //增加弹框默认数据
            allInitData.popupData = allInitData.popupData || {}
        }
        if (allInitData.popupData.popupName === undefined) {
            allInitData.popupData.popupName = ''
        }
        window.globalInitData = helperJs.deepCopy({}, allInitData)

        var verifyData = helperJs.deepCopy({}, allResponseData.verifyData)  //所有产品的验证数据
        window.verifyData = verifyData

        /**
         * @Author   Lizh
         * @DateTime 2019-07-04
         * @param    {[type]}   !pBType [description]
         * @return   {[type]}            [description]
         */
        if (!pBType) {
            var recipientInfo = allInitData.inputData.personData.recipientInfo
            recipientInfo && recipientInfo.eleOrderList.map(function (ele) {
                if (ele.key === 'name' || ele.key === 'sex') {
                    ele.isHide = true
                }
            })
        }

        helperJs.analysisInitData(allInitData, verifyData, true)  //解析初始化数据
        allInitData.inputData.productGroupList.map(function (group) {  //解析限制条件
            group.prodOrderList.map(function (prod) {
                helperJs.analysisCondition(prod, verifyData, allInitData)
            })
        })
        createVue(allResponseData)
    },

    //函数：针对某些特殊需求，改变配置数据
    changeInitData: function(aData, Vue, callback) {
        if (!pBType) {
            callback && callback()
            return false
        }
        var helperJs = this
        if (helperJs.isObjExist(aData, ['initData', 'inputData', 'personData', 'personOrderList'])) {
            var personList = aData.initData.inputData.personData.personOrderList  //获取人员信息例表
            if (personList.length) {  //如果有人员信息
                if (pBType.match('insPolicy')) {  //从家庭保单点击进入
                    personList.map(function (p, i) {  //家庭保单，删除配偶豁免
                        p.key == 'spouseInfo' && personList.splice(i, 1)
                    })
                    personList.map(function (person, i) {
                        var eleIdx
                        person.eleOrderList.map(function (ele, eIdx) {
                            if (ele.key == 'age') {
                                eleIdx = eIdx
                                ele.isHide = true  //保单整理，隐藏年龄
                            }
                        })
                        person.eleOrderList.splice(eleIdx + 1, 0, {  //在年龄元素后，加生日元素
                            key: "birthday",
                            value: "",
                            isHide: false
                        })
                        if (person.key == 'insuredInfo' ) {
                            person.eleOrderList.map(function (ele, eIdx) {  //所有元素置为不可选
                                ele.isDisabled = true
                            })
                            person.eleOrderList.splice(eleIdx + 2, 0, {
                                key: "insuranceDay",
                                labelName: "投保日",
                                value: '',
                            })
                            person.eleOrderList.splice(1, 0, {  //新增name元素
                                key: "name",
                                isDisabled: true,
                                value: ""
                            })
                        }
                    })

                    var insuredInfo = helperJs.getArraySubEle(personList, 'key', 'insuredInfo')
                    var applicantInfo = helperJs.getArraySubEle(personList, 'key', 'applicantInfo')
                    helperJs.vueAxios({  //请求家庭成员列表
                        self: Vue.prototype,
                        type: "get",
                        url: baseApiPath + '/planBook/insurePlan/getMembers?cId=' + gCrmId + (helperJs.getUrlParam('userUuid') ? '&userUuid=' + helperJs.getUrlParam('userUuid') : ''),
                    }, function (res) {
                        if (res.data.success) {
                            var familyData = res.data.data
                            familyData.splice(0, 0, {  //设置一个必有的投保人。当家庭成员不满足条件时，默认选此值
                                birthday: helperJs.getDateString(new Date(new Date().getFullYear() - 30, new Date().getMonth(), new Date().getDate()).getTime()),
                                cid: '',
                                name: "投保人",
                                sex: 1
                            })

                            familyData.map(function (fm, i) {
                                if (fm.cid == gCrmId) {  //设置被保人默认信息
                                    fm.age = helperJs.getAgeFromBirth(fm.birthday)
                                    insuredInfo && insuredInfo.eleOrderList.map(function (ele, i) {
                                        fm[ele.key] !== undefined && (ele.value = fm[ele.key])
                                    })
                                }
                            })

                            // if (applicantInfo) {
                                helperJs.getInsPolicyInfo(aData, Vue, function (policyRes) { //获取保单整理相关信息
                                    var activeMemberId
                                    if (policyRes) {
                                        helperJs.getArraySubEle(insuredInfo.eleOrderList, 'key', 'insuranceDay').value = policyRes.insuranceDayStr
                                        activeMemberId = policyRes.holderId
                                        window.gPolicyId = policyRes.id
                                    } else {
                                        activeMemberId = familyData[familyData.length > 1 ? 1 : 0].cid
                                    }
                                    if (applicantInfo) {
                                        applicantInfo && applicantInfo.eleOrderList.splice(1, 0, {  //投保人新增家庭成员选择元素
                                            key: "activeMemberId",
                                            labelName: '家庭成员',
                                            componentName: 'cmInfoMemberId',
                                            opts: familyData,
                                            value: activeMemberId
                                        })

                                        var curApplicant = helperJs.getArraySubEle(familyData, 'cid', activeMemberId)
                                        curApplicant.age = helperJs.getAgeFromBirth(curApplicant.birthday)
                                        applicantInfo && applicantInfo.eleOrderList.map(function (ele, i) {  //设置投保人的默认信息
                                            if (curApplicant[ele.key] !== undefined && (!resultUuid || activeMemberId)) {  //非数据导入且有投保人，将保单整理中投保人的值赋到初始化数据中
                                                ele.value = curApplicant[ele.key]
                                                ele.isDisabled = !!activeMemberId
                                            }
                                        })
                                    }
                                    callback && callback(aData)
                                })
                            // } else {
                            //     callback && callback(aData)
                            // }
                        }
                    })
                } else if (pBType.match('familyPlan2')) {
                    personList.map(function (p, i) {  //家庭保单，删除配偶豁免
                        p.key == 'spouseInfo' && personList.splice(i, 1)
                    })
                    // personList.map(function (person, i) {
                    //     person.eleOrderList.map(function (ele, eIdx) {
                    //         ele.isDisabled = true
                    //     })
                    // })
                    personList.map(function (person, i) {
                        person.eleOrderList.splice(1, 0, {  //新增name元素
                            key: "name",
                            isDisabled: true,
                            value: "投保人"
                        })
                    })


                    var r = window.location.search.substr(1).match(new RegExp("(^|&)param=([^&]*)(&|$)"));
                    var urlParam = JSON.parse(decodeURIComponent(r[2]))

                    if (urlParam && urlParam.personData) {
                        personList.map(function (person, i) {
                            if (urlParam.personData[i]) {
                                person.eleOrderList.map(function (ele, ei) {
                                    ele.isDisabled = true
                                    if (ele.key === 'title') {
                                        ele.isImport = false
                                    }
                                    if (urlParam.personData[i][ele.key] !== undefined) {
                                        ele.value = urlParam.personData[i][ele.key]
                                    }
                                })
                            }
                        })
                    }
                    callback && callback(aData)
                } else if (pBType.match('record')) {
                    personList.map(function (person, i) {
                        let index = -1
                        person.eleOrderList.map((ele, ei) => {
                            if (ele.key === 'sex') {
                                index = ei
                            }
                            if (ele.key === 'title') {
                                ele.value = true
                                ele.isShowCheckbox = false
                            }
                        })
                        if (index >= 0) {
                            person.eleOrderList.splice(index, 0, {  //新增name元素
                                key: "name",
                                value: "",
                                maxlength: 16
                            })
                        }
                    })
                    aData.initData.inputData.recordSetting = {
                        voiceType: aData.userSex || 1
                    }
                    callback && callback(aData)
                } else {
                    callback && callback(aData)
                }
            }
        }
    },

    //函数：获取保单的被保人、投保人、投保日信息
    getInsPolicyInfo: function (allData, Vue, callback) {
        if (resultUuid) {
            return helperJs.vueAxios({  //请求家庭成员列表
                self: Vue.prototype,
                type: "get",
                url: baseApiPath + '/planBook/insurePlan/getInsurePlan?insuredId=' + gCrmId + '&resultUuid=' + resultUuid,
            }, function (res) {
                if (res.data.success && res.data.data) {
                    callback && callback(res.data.data)
                }
            })
        } else {
            callback && callback()
        }
    },

    //函数：将结果页的投保数据取回
    getInitDataFromResult: function(allData, Vue, callback) {
        var self = this
        if (!resultUuid && !schemeUuid && !storageUuid) {
            callback && callback()
            return
        }

        return helperJs.vueAxios({  //请求家庭成员列表
            self: Vue.prototype,
            type: "get",
            url: baseApiPath + '/planBook/insureScheme/getImportData',
            data: {
                storageUuid: storageUuid || '',
                resultUuid: resultUuid || '',
                schemeUuid: schemeUuid || ''
            }
        }, function (res) {
            if (res.data.success && res.data.data) {
                var resultData = res.data.data;
                var combineProdArr = []
                resultData.productGroupList.map(function (group, gi) {
                    group && group.prodOrderList.map(function (prod, pi) {
                        prod.isTemp && combineProdArr.push(prod.key)
                    })
                })

                if (combineProdArr.length) {
                    helperJs.vueAxios({  //请求家庭成员列表
                        self: Vue.prototype,
                        type: "get",
                        url: baseApiPath + '/planBook/productTemp/getTempProducts?productIds=' + combineProdArr.join(','),
                    }, function (tempRes) {
                        var iGroupList = allData.initData.inputData.productGroupList
                        if (iGroupList && tempRes.data.success && tempRes.data.data) {
                            tempRes.data.data.map(function (temp) {
                                var rGroupList = temp.initData.inputData.productGroupList
                                rGroupList.map(function (group, gi) {
                                    iGroupList[gi].prodOrderList = iGroupList[gi].prodOrderList.concat(group.prodOrderList)
                                })
                                for (var k in temp.verifyData) {
                                    allData.verifyData[k] = temp.verifyData[k]
                                }
                            })
                            helperJs.assignInitData(allData, resultData, callback)
                        }
                    })
                } else {
                    helperJs.assignInitData(allData, resultData, callback)
                }
            } else {
                storageUuid = null
                callback && callback()
            }
        })
    },

    //函数：结果页数据，赋值到初始化数据中
    assignInitData: function(allData, resultData, callback) {
        var iPersonData = allData.initData.inputData.personData
        var rPersonData = resultData.personData
        for (var i in iPersonData) {
            if (i == 'personOrderList') {
                if (iPersonData[i] && rPersonData[i]) {
                    iPersonData[i].map(function (person, pi) {
                        if (pBType == 'as_planbook') {  //保单年检 2019.4.10
                            ["cid", "birthday", "insuranceDay", "name", "policyNo"].map(function (pKey) {
                                if (rPersonData[i][pi] && rPersonData[i][pi][pKey]) {
                                    person[pKey] = rPersonData[i][pi][pKey]
                                }
                            })
                        }

                        person.eleOrderList.map(function (ele, ei) {
                            rPersonData[i][pi] && rPersonData[i][pi][ele.key] !== undefined && (ele.value = rPersonData[i][pi][ele.key])
                        })
                    })
                }
            }
            if (i == 'recipientInfo') {
                if (helperJs.isObjExist(iPersonData, [i, 'eleOrderList']) && rPersonData[i]) {
                    iPersonData[i].eleOrderList.map(function (ele) {
                        iPersonData[i][ele.key] && (ele.value = rPersonData[i][ele.key])
                    })
                }
            }
        }

        var iGroupList = allData.initData.inputData.productGroupList
        var rGroupList = resultData.productGroupList
        iGroupList.map(function (group, gi) {
            var resultGroup = rGroupList[gi]  //从resultUuid取回的产品组合数据
            resultGroup && group.prodOrderList.map(function (prod, pi) {
                var resultProd = helperJs.getArraySubEle(resultGroup.prodOrderList, 'key', prod.key)  //从resultUuid取回的产品数据
                if (resultProd) {
                    resultProd.adjustBaoeData && (prod.adjustBaoeData = resultProd.adjustBaoeData)  //调整保额数据
                    prod.inputResultSwitch = !!resultProd.inputResultSwitch
                    prod.resultImport = true
                    for (var k in prod) {  //resultUuid取回的产品数据，赋值到初始化中的产品对象中
                        if (k == 'mulInsOrderList') {
                            prod.mulInsOrderList.map(function (ins, ii) {  //resultUuid取回的险种数据，赋值到初始化中的险种对象中
                                var resultInsurance = helperJs.getArraySubEle(resultProd.mulInsOrderList, 'key', ins.key)
                                if (resultInsurance) {
                                    //下为处理从结果页中导入数值时，保额保费互算问题 2018.12.11
                                    if (helperJs.getArraySubEle(ins.eleOrderList, 'key', 'calMethod') && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe') && helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baof') && resultInsurance.calMethod) {
                                        if (resultInsurance.calMethod === "baoe2baof") {
                                            helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe').isHide = false
                                            helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baof').isHide = true
                                        } else {
                                            helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe').isHide = true
                                            helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baof').isHide = false
                                        }
                                    }
                                    if (resultInsurance.inputResult !== undefined) {
                                        ins.inputResult = resultInsurance.inputResult
                                    }
                                    ins.eleOrderList.map(function (ele, ei) {
                                        resultInsurance[ele.key] && (ele.value = resultInsurance[ele.key])
                                    })

                                    /**
                                     * 万能账户存在，可以不加追加领取数据
                                     * @Author   Lizh
                                     * @DateTime 2019-12-04
                                     */
                                    for (var ik in ins) {
                                        if (['reduceBaof'].indexOf(ik) !== -1) {
                                            resultInsurance[ik + 'Data'] && (ins[ik + 'Data'] = resultInsurance[ik + 'Data'])
                                        }
                                    }
                                } else {
                                    ins.eleOrderList && ins.eleOrderList.map(function (ele, ei) {
                                        ele.key == 'title' && (ele.value = false)
                                    })
                                }
                            })
                        }
                    }
                }
            })
        })
        callback && callback()
    },

    //函数：解析初始化数据
    //参数: initData: 初始化数据
    //      verifyData: 验证条件
    analysisInitData: function (initData, verifyData, init) {
        var helperJs = this
        var inputData = initData.inputData

        var ageRange = {
            insuredInfo: [ //被保人年龄范围
                [],  //男，年龄范围
                []   //女，年龄范围
            ],
            // applicantInfo: [ //投保人年龄范围
            //     [],  //男，年龄范围
            //     []   //女，年龄范围
            // ]
        }

        if (!pBType &&
            inputData.personData.recipientInfo &&
            inputData.personData.recipientInfo.eleOrderList &&
            inputData.personData.recipientInfo.eleOrderList.every(function (ele) {
                return ele.key !== 'shareTitle'
            })
        ) { //自定义转发封面名称。2019.03.11
            inputData.personData.recipientInfo.eleOrderList.push({
                key: "shareTitle",
                labelName: "转发标题",
                value: "",
                componentName: 'cmInfoName',
                placeholder: '请输入计划书转发标题'
            })
        }

        if (init && inputData.personData.personOrderList && pBType == 'multPBCompare') {  //多对比计划书，所有人员信息不可修改
            inputData.personData.personOrderList = inputData.personData.personOrderList.filter(function (person, idx) {
                return idx < 2
            })
            var personOrderList = inputData.personData.personOrderList
            var mcParam = JSON.parse(decodeURIComponent(helperJs.getUrlParam('param')))
            mcParam && personOrderList.map(function (person, idx) {
                if (idx < 2) {
                    person.eleOrderList.map(function (ele, ei) {
                        ele.isDisabled = true;
                        (mcParam.personData[idx] && mcParam.personData[idx][ele.key] !== undefined) && (ele.value =  mcParam.personData[idx][ele.key])
                        if (ele.key === 'title') {
                            ele.value = true
                        }
                    })
                }
            })
        }

        if (init && personOrderList && pBType == 'familyPlan') {  //家庭计划书加姓名
            personOrderList[0].eleOrderList.splice(1, 0, {
                key: 'name',
                value: ''
            })
        }

        if (inputData && inputData.productGroupList ) {
            inputData.productGroupList.map(function (group) {
                var hasRequiredProd  //计划书是否有必选产品
                if (group.prodOrderList) {
                    hasRequiredProd = group.prodOrderList.some(function (prod, pi) {
                        return pi < group.defNum && !!prod.required && !prod.isTemp
                    })
                }

                group.prodOrderList && group.prodOrderList.map(function (prod, pIdx) {
                    // var compareInfo = helperJs.getUrlParam('compareInfo')   //取对比信息，判断是否为对比
                    // if (compareInfo) {  //如果需要对比的投保页，取链接个带的性别、年龄默认值
                    //     var insuredData = helperJs.filterArr(inputData.personData.personOrderList, 'insuredInfo')
                    //     helperJs.filterArr(insuredData.eleOrderList, 'age').value = JSON.parse(decodeURI(compareInfo)).age
                    //     helperJs.filterArr(insuredData.eleOrderList, 'sex').value = JSON.parse(decodeURI(compareInfo)).sex
                    // }


                    var common = {  //通用信息
                        "key": "common",
                        "eleOrderList": [],
                    };

                    var hasRequiredIns = prod.mulInsOrderList && prod.mulInsOrderList.some(function (ins) {  //产品中是否有必选险种
                        return !!ins.required && verifyData[prod.key] && verifyData[prod.key][ins.key]
                    })
                    if (prod.mulInsOrderList && prod.mulInsOrderList.some(function (ins) {  //产品中是否调整保额
                        return !!ins.adjustBaoe
                    })) {
                        prod.adjustBaoeData = prod.adjustBaoeData || null
                    }

                    prod.mulInsOrderList && prod.mulInsOrderList.map(function (ins, idx) {
                        //同时有保额和计划时，若保额被隐藏则显示计划 2019.09.11
                        var baoeUi = helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baoe')
                        ins.showPlanDesc = !!(helperJs.getArraySubEle(ins.eleOrderList, 'key', 'plan') && baoeUi && baoeUi.isHide)

                        if (ins.reduceBaof) { //提前加字段，便于 vue 数据双向绑定
                            ins.reduceBaofData = ins.reduceBaofData || null
                        }
                        if (verifyData && verifyData[prod.key] && verifyData[prod.key][ins.key]) {  //险种有费率
                            verifyData[prod.key][ins.key].map (function (vCondi) {  //取险种的年龄范围
                                //无必选产品，根据所有产品的最小值，最大值确定；有必选产品, 根据必选产品的最小值，最大值确定
                                //无必选险种，根据所有险种的最小值，最大值确定；如果有必选险种：根据必选险种的最小值，最大值确定
                                if (!prod.isTemp && (!hasRequiredProd || prod.required) && (!hasRequiredIns || ins.required) ){
                                    if (!ins.huomian || ins.huomian == 'beiHuomian') {  //被保人所有年龄取值
                                        /**
                                         * 投保人年龄范围，取管理后面配置
                                         * 2019.10.23
                                         */
                                        var ageRangeType = ageRange.insuredInfo[vCondi.sex - 1]
                                        ageRange.insuredInfo[vCondi.sex - 1] = [
                                            ageRangeType[0] === undefined ? vCondi.minAge : Math.min(ageRangeType[0], vCondi.minAge),
                                            ageRangeType[1] === undefined ? vCondi.maxAge : Math.max(ageRangeType[1], vCondi.maxAge)
                                        ]
                                    }
                                }
                            })
                        } else {  //险种没有费率
                            console.log(prod.titleName + '-' + prod.key + ' -> ' + ins.name + '-' + ins.key + ': 当前险种没有费率表')
                        }

                        ins.eleOrderList.map(function (ele) {  //提取公用信息
                            if (ele.common && !helperJs.filterArr(common.eleOrderList, ele.key)) {
                                common.eleOrderList.push(ele)
                                if (idx == 0) {  //通用信息，与跟随其后的险种不留间距
                                    ins.isFollowing = true
                                }
                            }
                        })
                        ins.eleOrderList = ins.eleOrderList.filter(function (ele) { return !ele.common })  //遍历险种，去除险种中的通用信息
                    })

                    if (common.eleOrderList.length) {  //把通用信息当作一个险种，并加入到产品险种列表的第一个元素
                        prod.mulInsOrderList = prod.mulInsOrderList.filter(function (mIns) { return mIns.key != 'common' })
                        prod.mulInsOrderList.splice(0, 0, common)
                    }
                    helperJs.createGroupIns(prod, true)  //生成险种组合数据
                })
            })

            //设置计划书年龄范围
            if (init && helperJs.isObjExist(inputData, ['personData', 'personOrderList'])) {  //设置计划书年龄范围
                inputData.personData.personOrderList.map(function (person) {
                    if (ageRange[person.key] && ageRange[person.key][0].length) { //设置计划书中被保人年龄范围
                        helperJs.filterArr(person.eleOrderList, 'age').opts = ageRange[person.key][0]
                        if (ageRange[person.key][0].join() != ageRange[person.key][1].join()) {  //男女取值范围不同
                            helperJs.filterArr(person.eleOrderList, 'age').optsF = ageRange[person.key][1]
                        }

                        //默认年龄不在范围内，取最大年龄
                        if (helperJs.filterArr(person.eleOrderList, 'age').value < ageRange[person.key][helperJs.filterArr(person.eleOrderList, 'sex').value - 1][0] || helperJs.filterArr(person.eleOrderList, 'age').value > ageRange[person.key][helperJs.filterArr(person.eleOrderList, 'sex').value - 1][1]) {
                            helperJs.filterArr(person.eleOrderList, 'age').value = ageRange[person.key][helperJs.filterArr(person.eleOrderList, 'sex').value - 1][1]
                        }
                    }
                })
            }
        }

        return initData;
    },


    //函数: 解析数据，获取保险期间，缴期期间等。以产品为单位
    //参数:
    analysisCondition: function (prodData, conditionData, initData) {
        var helperJs = this
        if (!prodData || !conditionData) { return; }
        var ageRangeProd = [  //产品年龄范围
            [], //产品年龄范围，男
            [] //产品年龄范围，男
        ]
        if (conditionData[prodData.key]) { //产品费率
            var personData = self && helperJs.convertPersonData(initData.inputData.personData)  //关于人的信息
            var hasRequiredIns = prodData.mulInsOrderList && prodData.mulInsOrderList.some(function (ins) { //产品中是否有必选险种
                return !!ins.required && conditionData[prodData.key][ins.key]
            })

            prodData.mulInsOrderList.map(function (insurance, iIdx, mulIns) {  //遍历险种
                var insuranceCondi = conditionData[prodData.key] && conditionData[prodData.key][insurance.key]  //当前险种的限制条件
                if (insuranceCondi) {  //险种存在费率
                    if ((!insurance.huomian || insurance.huomian == 'beiHuomian') && (!hasRequiredIns || (hasRequiredIns && insurance.required) ) ) {  //产品年龄范围取各险种最大范围
                        insuranceCondi.map(function (insCondi) {  //取产品年龄范围
                            ageRangeProd[insCondi.sex - 1] = [
                                ageRangeProd[insCondi.sex - 1][0] === undefined ? insCondi.minAge : Math.min(ageRangeProd[insCondi.sex - 1][0], insCondi.minAge),
                                ageRangeProd[insCondi.sex - 1][1] === undefined ? insCondi.maxAge : Math.max(ageRangeProd[insCondi.sex - 1][1], insCondi.maxAge)
                            ]
                        })
                    }

                    var isTouHuomian = insurance.huomian == 'touHuomian' || insurance.huomian == 'shuangHuomian'  //双豁免是种特殊的投保人豁免。双豁免包含投保人豁免和投保人配偶豁免。如果没有选中配偶信息，则认为是投保人豁免，选中则认为投保人豁免和配偶豁免都选中
                    var personType = isTouHuomian ? 'applicantInfo' : 'insuredInfo'
                    var curPersonData
                    if (personData) {   //关于人的信息
                        if (isTouHuomian && insurance.allowSamePerson && helperJs.filterArr(personData.personOrderList, 'applicantInfo')) {    //如果险种可以附加被保人，也可以附加投保人。选中投保人，则附加到投保人
                            personType = helperJs.filterArr(personData.personOrderList, 'applicantInfo').title ? 'applicantInfo' : 'insuredInfo'
                        }
                        curPersonData = helperJs.filterArr(personData.personOrderList, personType)
                    }

                    if (curPersonData) {  //取当前性别、年龄下的费率条件
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
                    if (!insuranceCondi || (isTouHuomian && !insurance.allowSamePerson && (!curPersonData || !curPersonData.title || curPersonData.applicantAndInsuredSame))) { //如果险种不存在费率限制条件或者投保人豁免在没有选中投保人信息的条件下，险种不可选
                        eleTitle.isDisabled = true  //不存在费率，险种不可选
                        eleTitle.value = false  //险种不选中
                        console.log( eleTitle.labelName + '-' + insurance.key + ': 人员信息不符，险种不可选')
                    } else {
                        eleTitle.isDisabled = false  //存在费率，险种可选
                        if (insurance.required && (!insurance.groupKey || insurance.isCheckbox)) {  //如果是必选险种，险种一定选中
                            eleTitle.value = true
                            eleTitle.isDisabled = true
                            console.log( eleTitle.labelName + '-' + insurance.key + ': 当前险种为必选险种')
                        }
                    }

                    var curEleCondi //储存当前元素限制条件。以便下一个限制条件回归调用
                    while (insuranceCondi && insuranceCondi.key && insuranceCondi[insuranceCondi.key]) {  //遍历当前险种的限制条件
                        var eleCondi = insuranceCondi[insuranceCondi.key]
                        var eleData = helperJs.filterArr(insurance.eleOrderList, insuranceCondi.key)
                        if (!eleData && helperJs.filterArr(prodData.mulInsOrderList, 'common')) {   //不存在元素且为通用信息
                            eleData = helperJs.filterArr(helperJs.filterArr(prodData.mulInsOrderList, 'common').eleOrderList, insuranceCondi.key)
                        }

                        var index = null //获取当前元素的序号，以便于下一个调用
                        if (eleData) {  //元素存在费率
                            insurance.eleOrderList.map(function (curEle, idx) {  //获取当前元素的序号，以便于下一个调用
                                curEle.key == eleData.key && (index = idx)
                            })

                            //元素隐藏且非不可修改状态，取对应关联的险种的值
                            if (eleData.isHide && !eleData.isDisabled && insurance.refInsuranceId && insurance.refInsuranceId != -2) {
                                var refInsData     //数据取值来源的险种
                                if (insurance.refInsuranceId == -1) {  //关联主险
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
                                            var minusAge = insurance.huomian === 'touHuomian' ? personData.personOrderList[0].age : curPersonData.age
                                            eleData.value = 'b' + (refEleData.value.replace(/[^0-9]/,"") * 1 - minusAge - (insurance.pMinus || 0))
                                        }
                                    } else {
                                        eleData.value = refEleData.value
                                    }
                                }
                                if (helperJs.filterArr(refInsData.eleOrderList, 'title').isDisabled) {  //所关联的险种不可选，当前险种也不可选
                                    eleTitle.isDisabled = true
                                }
                            } else {
                                var oldOpts = eleData.opts.slice(0)
                                eleData.opts = []
                                eleCondi.map(function (condIns) {
                                    if (condIns.value !== undefined && condIns.desc !== undefined) {
                                        var newOpt = {
                                            val: condIns.value,
                                            desc: condIns.desc,
                                        }
                                        if (oldOpts[eleData.opts.length]) {
                                            newOpt.isHide = oldOpts[eleData.opts.length].isHide
                                            newOpt.isDisabled = oldOpts[eleData.opts.length].isDisabled
                                        }
                                        eleData.opts.push(newOpt)
                                    }
                                })

                                if (eleData.opts && !eleData.opts.length) {     //管理对应选项。为空删除。有值则设置默认值
                                    delete eleData.opts
                                } else if (eleData.opts.every(function (ele) { return ele.val != eleData.value })) {
                                    eleData.value = eleData.opts[0].val
                                }
                            }
                        }

                        insuranceCondi = eleCondi.filter(function (condIns) {   //提定下一个元素的限制条件
                            eleData || console.log(`${insurance.name} - ${condIns && condIns.key}元素不存在：`, condIns)
                            return eleData && condIns.value == eleData.value
                        })[0]


                        if (!insuranceCondi && curEleCondi && eleData) {  //如果元素的value不存在，则遍历上一个元素，查看上一元素其他选项是否有。curEleCondi为上一元素的条件选项
                            curEleCondi.map(function (preCondi) {
                                if (!insuranceCondi && preCondi[eleData.key].some( function (curCondi) {
                                    return curCondi.value == eleData.value
                                })) {
                                    insuranceCondi = preCondi[eleData.key]
                                    insurance.eleOrderList[index - 1].value = preCondi.value
                                }
                            })
                        }

                        if (eleData && eleData.isHide && !eleData.isDisabled && index && index >= 1 && curEleCondi) {  //2017.11.28 如果当前元素的value值，在上一个元素中只有一个选项中有，上一个元素设为不可选
                            var preEleData = insurance.eleOrderList[index - 1]
                            if (preEleData.opts && preEleData.opts.length) {
                                preEleData.opts = []
                                curEleCondi.map(function (preCondi) {
                                    if (insuranceCondi && preCondi[eleData.key].some( function (curCondi) {
                                        return curCondi.value == eleData.value
                                    })) {
                                        preEleData.opts.push({
                                            val: preCondi.value,
                                            desc: preCondi.desc
                                        })
                                    }
                                })
                            }
                        }

                        curEleCondi = eleCondi  //储存当前元素限制条件，用于下一条件回归调用
                        if (!insuranceCondi || (isTouHuomian && !insurance.allowSamePerson && (!curPersonData || !curPersonData.title || curPersonData.applicantAndInsuredSame))) { //如果险种不存在费率限制条件或者投保人豁免在没有选中投保人信息的条件下，险种不可选
                            eleTitle.isDisabled = true  //不存在费率，险种不可选
                            eleTitle.value = false  //险种不选中
                            console.log( eleTitle.labelName + '-' + insurance.key + ': 没有费率，不可选')
                        } else {
                            eleTitle.isDisabled = false  //存在费率，险种可选
                            if (insurance.required && (!insurance.groupKey || insurance.isCheckbox)) {  //如果是必选险种，险种一定选中
                                eleTitle.value = true
                                eleTitle.isDisabled = true
                            }
                        }
                    }
                }
            })

            helperJs.createGroupIns(prodData)
            var insuredData = helperJs.filterArr(personData.personOrderList, 'insuredInfo') //被保人，不符合性别、年龄条件，隐藏产品
            if (conditionData && conditionData[prodData.key] && Object.keys(conditionData[prodData.key]).length) {
                if (!ageRangeProd[insuredData.sex - 1].length || (insuredData.age < ageRangeProd[insuredData.sex - 1][0] || insuredData.age > ageRangeProd[insuredData.sex - 1][1])) {
                    prodData.hide = true
                    prodData.totalBaof = 0
                } else {
                    prodData.hide = false
                }
            }
        }
    },


    //函数：生成一个由多个险种组成的险种组合
    //prodData: 产品的数据
    //init: 是否为初始化。布尔值
    createGroupIns: function(prodData, init) {
        var helperJs = this
        if (prodData.mulInsOrderList && prodData.mulInsOrderList.length) {
            var oldGroupInsList = {}
            prodData.mulInsOrderList = prodData.mulInsOrderList.filter(function (ins) {  //清空险种列表中的险种组合
                ins.isGroup && (oldGroupInsList[ins.key] = ins)
                return !ins.isGroup
            })

            var newGroupInsList = {};
            prodData.mulInsOrderList.map(function (ins, idx) {
                if (ins.groupKey) {  //多险种选一，或多险种选多。生成一个组合，如多个险种合成豁免险
                    // ins.isCheckbox = true
                    var oldTitleValue
                    var oldInsIdValue
                    if (Object.keys(oldGroupInsList).length) {
                        oldTitleValue = helperJs.filterArr(oldGroupInsList[ins.groupKey].eleOrderList, 'title').value
                        oldInsIdValue = helperJs.filterArr(oldGroupInsList[ins.groupKey].eleOrderList, 'insuranceId').value
                    }

                    newGroupInsList[ins.groupKey] = newGroupInsList[ins.groupKey] || {
                        key: ins.groupKey,
                        name: ins.groupName,
                        isGroup: true,
                        eleOrderList: [
                            {
                                "key": "title",
                                "value": oldTitleValue || false,
                                "isDisabled": false,
                                "componentName": "cmCommonTitle",  //险种标题组件。
                                "labelName": ins.groupName,  //险种标题
                            }, {
                                "key": "insuranceId",
                                "value": oldInsIdValue || (ins.isCheckbox ? [] : ''),
                                "componentName": ins.isCheckbox ? "cmCommonCheckbox" : "cmCommonRadio",
                                "opts": []
                            }
                        ]
                    }
                    var eleTitle = helperJs.filterArr(ins.eleOrderList, "title")  //当前险种标题
                    var insuranceId = newGroupInsList[ins.groupKey].eleOrderList.filter(function (ele) { return ele.key == "insuranceId"})[0] //当前组合险的选项
                    insuranceId.opts.push({  //当险种转换成险种组合的选项
                        val: ins.key,
                        desc: eleTitle.labelName,
                        isDisabled: eleTitle.isDisabled
                    })
                }
            })

            for (var k in newGroupInsList) {  //把多个险种组合成一个险种，并加入到产品险种列表中
                var groupTitle = helperJs.filterArr(newGroupInsList[k].eleOrderList, 'title')  //组合险标题
                var groupInsuranceId = helperJs.filterArr(newGroupInsList[k].eleOrderList, 'insuranceId')   //组合险列表
                var groupInsList = prodData.mulInsOrderList.filter(function (ins, i) {  //组合险下的子险种列表
                    return ins.groupKey == k
                })
                if (groupInsuranceId) {  //存在险种列表
                    if (groupInsuranceId.opts.every(function (opt) {  //所有险种都不可选，则组合险不可修改且不选中。否则，组合险种可选
                        return !!opt.isDisabled
                    })) {
                        groupTitle.value = false
                        groupTitle.isDisabled = true
                    } else {
                        groupTitle.isDisabled = false
                    }

                    groupInsList.map(function (ins) {
                        var subInsTitle = helperJs.getArraySubEle(ins.eleOrderList, 'key', 'title')
                        if (ins.required && !subInsTitle.isDisabled && (!groupTitle.value || !groupTitle.isDisabled)) {  //如果组合险中有一款是必选的，则整个组合险为选中状态
                            groupTitle.value = true
                            groupTitle.isDisabled = true
                        }
                        if (init && !groupInsuranceId.value && subInsTitle.value && !subInsTitle.isDisabled) {  //初始化时，设置组合险默认值
                            groupInsuranceId.value = ins.key
                            groupTitle.value = true
                        }
                    })

                    if (groupInsuranceId.value.constructor === Array ) {
                        groupInsuranceId.opts = groupInsuranceId.opts && groupInsuranceId.opts.filter(function (opt, i) {
                            return groupInsuranceId.value.indexOf(opt.val) !== -1 && !opt.isDisabled
                        })
                    } else {
                        if (groupInsuranceId.value && helperJs.getArraySubEle(groupInsuranceId.opts, 'val', groupInsuranceId.value).isDisabled) {
                            groupInsuranceId.value = ''
                        }
                    }

                    if (groupInsuranceId.value) {
                        var checkedIns = helperJs.filterArr(prodData.mulInsOrderList, groupInsuranceId.value)  //当前选中险种
                        for (var ck in checkedIns) {  //将当前选中险种的部分数据复制到组合险中
                            if (['code', 'groupKey', 'groupName', 'isFollowing', 'key', 'name'].indexOf(ck) === -1) {
                                if (ck == 'eleOrderList') {  //不需要原险种的标题
                                    newGroupInsList[k][ck] = newGroupInsList[k][ck].concat(checkedIns[ck].filter(function (ele) { return ele.key != 'title'}))
                                } else {
                                    newGroupInsList[k][ck] = checkedIns[ck]
                                }
                            }
                        }
                    }
                }
                prodData.mulInsOrderList.push(newGroupInsList[k])
            }
        }
    },



    //函数：转换人员信息
    //参数：personData人员信息
    convertPersonData: function (personData) {
        var helperJs = this
        var resData = {}  //返回数据
        var convPersonData = {
            personOrderList: [],
            recipientInfo: {}
        }
        if (personData) {
            if (personData.recipientInfo) {  //转换收件人信息
                convPersonData.recipientInfo = helperJs.convertCalData(personData.recipientInfo)
            }
            if (personData.personOrderList) {  //转换被、投、投保人配偶的信息
                personData.personOrderList.map(function (person) {
                    convPersonData.personOrderList.push( helperJs.convertCalData(person) )
                })
            }
        }
        return convPersonData
    },

    //函数：计算产品数据的转换 (单个产品，包括个人信息数据)
    //参数：prodData, 产品数据
    convertProductData: function (prodData) {
        var helperJs = this
        var productData = {  //转换后的产品数据
            key: prodData && prodData.key,
            titleName: prodData && prodData.titleName,
            tradeId: prodData && prodData.tradeId,
            companyId: prodData && prodData.companyId,
            companyName: prodData && prodData.companyName,
            isTemp: prodData && prodData.isTemp,
            liabilityShowType: prodData && prodData.liabilityShowType,
            liabilityOrderList: prodData && prodData.liabilityOrderList,
            inputResultSwitch: prodData && prodData.inputResultSwitch,
            totalBaof: prodData && prodData.totalBaof,
            common: {},
            mulInsOrderList: []
        }

        prodData && prodData.adjustBaoeData && (productData.adjustBaoeData = prodData.adjustBaoeData)
        if (prodData) {
            prodData.mulInsOrderList.map(function (insurance, idx) {
                var insuranceData = helperJs.convertCalData(insurance)
                if (insuranceData.key == 'common') {
                    productData.common = insuranceData
                } else if (insuranceData.title && !insuranceData.groupKey) {
                    if (insuranceData.isGroup) { //组合险，则遍历其所选中的险种，并转换数据
                        var insuranceId = insuranceData.insuranceId.constructor == Array ? insuranceData.insuranceId : [insuranceData.insuranceId]
                        insuranceId.map(function (insId) {
                            var checkedIns = helperJs.filterArr(prodData.mulInsOrderList, insId)  //获取选中的险种
                            if (checkedIns) {
                                var checkedInsData = helperJs.convertCalData(checkedIns)  //转换选中的险种
                                insurance.account !== undefined && (checkedInsData.account = insurance.account)
                                insurance.accountData !== undefined  && (checkedInsData.accountData = insurance.accountData)
                                insurance.eleOrderList.map(function (ele) {
                                    if (ele.key != 'title' && ele.key != 'insuranceId') {
                                        checkedInsData[ele.key] = insuranceData[ele.key]
                                    }
                                })
                                productData.mulInsOrderList.push(helperJs.deepCopy({}, checkedInsData))
                            }
                        })
                    } else {
                        productData.mulInsOrderList.push(insuranceData)
                    }
                }
            })
        }

        return productData
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
                if (!insData.eleOrderList || !this.getArraySubEle(insData.eleOrderList, 'key', k)) {
                    resData[k] = insData[k]
                }
            }
        }
        return resData
    },


    //函数：接收计算结果 (单个产品)
    //参数：self，实例对象
    //     relate, 当前产品[产品组名称, 产品名称]
    //     prodData, 计算返回的产品数据
    receiveProductData: function (self, relate,  prodData) {
        var helperJs = this
        var productGroup = helperJs.filterArr(self.planbookData.productGroupList, relate[0])  //现有的产品数据
        var productData  = helperJs.filterArr(productGroup.prodOrderList, relate[1])  //现有的产品数据

        prodData.mulInsOrderList.map(function (ins, idx) {
            var insuranceData = helperJs.filterArr(productData.mulInsOrderList, ins.key)  //现有的险种数据
            if (ins.huomian === 'shm_spouse') {
                insuranceData.shmInsData = ins
            } else {
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

        if (prodData.mulInsOrderList.some(function (ins) { return ins.title })) {  //有选中险种
            self.$set(productData, 'hadChoice', true)  //该产品已经选中
            self.$set(productData, 'totalBaof', prodData.totalBaof)  //接收该产品总保费
        } else {
            self.$set(productData, 'hadChoice', undefined)  //该产品不选中
            self.$set(productData, 'totalBaof', undefined)  //总保费置空
        }

        prodData.companyName && self.$set(productData, 'companyName', prodData.companyName)
        var insShowArr
        if (prodData.insShowArr) {  //组合表格中数据
            insShowArr = prodData.insShowArr
        } else if (prodData.mulInsOrderList.length) {
            insShowArr = [['险种', '保额', '保费', '交费期']]
            prodData.mulInsOrderList.map(function (ins) {
                ins.title && !ins.resultFormulaRef && insShowArr.push([ins.name, ins.showPlanDesc ? ins.planDesc : (ins.baoeDesc || '-'), (ins.baofDesc === 0 || ins.baofDesc === "0" || ins.baofDesc) ? ins.baof : '-', ins.pPeriodDesc])
            })
        }
        insShowArr && (self.$set(productData, 'insShowArr', insShowArr.length > 1 ? insShowArr : undefined))

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
        var helperJs = this
        var axiosPromise
        if (!obj.withoutLoading) {
            window.appBridge && appBridge.showLoading && appBridge.showLoading()
        }

        obj.options = obj.options || {}
        obj.options.headers = {'X-Requested-With': 'XMLHttpRequest'}
        Axios.defaults.withCredentials = true;
        if( obj.type == 'get' ) {
            if (obj.data) {
                obj.options.params = obj.data;
            }
            axiosPromise = Axios.get(obj.url, obj.options);
        }else{
            axiosPromise = Axios.post(obj.url, obj.data || "", obj.options);
        }

        return axiosPromise.then(function (res) {
            if (res.data) {
                if ((res.data.success && res.data.data === -1) || res.data.code === 401) {
                    helperJs.gotoLogin()
                    return
                } else {
                    if (res.data.code == '002012' || res.data.code == '002015') {
                        !obj.withoutLoading && window.appBridge && appBridge.hideLoading && appBridge.hideLoading()
                        window.appBridge && appBridge.uiConfirm({
                            class: "my-family uiAlertAutoDisappear_error",
                            okText: "去认证",
                            cancelText: "以后认证",
                            content: "根据监管要求，保险从业人员应当具备保险从业资格证书，才可以从事保险行业。",
                            clickMaskHide: !1,
                            statEp: {
                                cancelBtnId: "fs_yhrz",
                                okBtnId: "fs_qrz",
                                uiVersion: 1,
                                action: "fs",
                                type: "tbyfs"
                            }
                        }).then(function () {
                            // ... 点击确定后的回调
                            helperJs.vueAxios({
                                self: obj.self,
                                url: location.protocol + '//insurance-tech-api.winbaoxian.' + (location.hostname.search(/pbf\.winbaoxian\.com/) === -1 ? 'cn' : 'com') + '/api/qualify/getQualifyPageUrl',
                                type: 'get'
                            }, function (res) {
                                if (res.data.code === 200 && res.data.data &&  res.data.data.pageUrl) {
                                    location.href = res.data.data.pageUrl + 4
                                }
                            })
                            // location.href = location.hostname.search(/pbf\.winbaoxian\.com/) === -1 ? 'https://user-operations.winbaoxian.cn/auth-main.html?nw=1&from=4' : 'https://dss.winbaoxian.com/app-chain-store-new/check.html?from=jhs_tby'
                        }).catch(function () {
                            // ... 点击取消后 、点击遮罩且遮罩可点时 的回调
                            history.go(-1)
                        });
                        return
                    } else if (res.data.code == '002013') {
                        obj.self.$toast('您今天做了太多计划书了，休息一下，明天再来吧')
                        return
                    } else {
                        res.data.info && obj.self.$toast(res.data.info)
                    }
                }
            }

            successFn && successFn(res)
            !obj.withoutLoading && window.appBridge && appBridge.hideLoading && appBridge.hideLoading()
        }).catch(function (res) {
            failFn && failFn(res)
            if (res.response && res.response.status === 401) {
                helperJs.gotoLogin()
                return
            }

            let toastMsg = res.response ? `status: ${res.response.status}-${res.response.statusText}。` : `msg: ${res.message}。`
            if (res.message.match(/Network Error/i) && navigator.userAgent.match(/Mobile\/(.+);/i) && navigator.userAgent.match(/Mobile\/(.+);/i)[1] == '16A5288q') {
                toastMsg += `iOS12测试版存在兼容问题，请及时升级ios至最新版`
            } else {
                toastMsg += `可以截图后点击右上角“反馈”，我们会立刻处理，谢谢！`
            }
            obj.self.$toast({
                message: toastMsg,
                duration: 3000
            })

            window.appBridge && appBridge.hideLoading && appBridge.hideLoading()
        })
    },



    //函数：改变人员信息时，调用方法
    //参数：
    changePersonInfo: function (obj, finishCB) {
        var self = obj
        var pInputData = obj.allInputData.inputData
        var productGroupList = pInputData.productGroupList;
        productGroupList && productGroupList.map(function (group) {
            if (!group.isHide) {
                group.prodOrderList.map(function (prod, pIdx) {
                    pInputData.productGroupList.map(function (group) {
                        group.prodOrderList.map(function (prod) {
                            helperJs.analysisCondition(prod, verifyData, {inputData: pInputData}) //重新解析限制条件
                        })
                    })

                    /**
                     * 产品中所有险种不可选
                     * @type {[type]}
                     */
                    var convertData = helperJs.convertProductData(prod)
                    if (convertData.productData.hadChoice && !convertData.productData.hide && !convertData.productData.mulInsOrderList.length) {
                        prod.hide = true

                        /**
                         * 性别年龄改变后，新华附加险都没选中的情况下，重新计算，总保费没有更新
                         * @Author   Lizh
                         * @DateTime 2019-10-30
                         */
                        if (!!self.$set) {
                            self.$set(prod, 'totalBaof', 0)
                        }
                    }

                    if (prod.hadChoice && !prod.hide) {
                        var errorMsg = helperJs.valideProd({
                                inputData: pInputData,
                                productData: prod
                            })
                        if (errorMsg) {  //验证不通过
                            prod.hadChoice = false
                            prod.hide = group.defNum && pIdx >= group.defNum
                            if (!!self.$set) {
                                self.$set(prod, 'totalBaof', 0)
                            }
                            delete prod.insShowArr
                            self.$toast(errorMsg)
                        } else {
                            return helperJs.calculateInsData({
                                self: self,
                                inputData: pInputData,
                                groupData: group,
                                productData: prod,
                                calType: 'personInfo'
                            }, finishCB)
                        }
                    } else {
                        prod.hadChoice = false
                        delete prod.insShowArr
                    }
                })
            }
        });
    },

    //函数：对产品进行验证，并返回验证结果
    //参数：
    //vData: 需要验证的数据
    //isSkip: 出现错误时跳过验证，并返回错误信息；false，则继续执行
    valideProd: function (vData, isSkip) {
        var errorMsg
        var vProductData = vData.productData
        if (vProductData.restrictList && vProductData.restrictList.length) {  //验证同一产品中各险种的限制
            errorMsg = helperJs.verifyProdRestricts({
                productData: vProductData,
                insData: vData.insData,
                eleData: vData.eleData
            }, vData.planbookData)
        }

        if (!errorMsg || isSkip) {
            vProductData.mulInsOrderList.map(function (ins) {
                ins.eleOrderList.map(function (ele) {
                    if (errorMsg && !isSkip) { return }
                    if (ele.restrictions && ele.restrictions.length) {  //同一险种间不同元素的校验
                        errorMsg = helperJs.verifyInsRestricts({
                            productData: vProductData,
                            insData: ins,
                            eleData: ele
                        }, vData.planbookData)
                    }

                    if (errorMsg && !isSkip) { return }
                    var ruleName = ele.ruleName || ('rule' + ins.key + ele.key.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase() }))
                    if (window.verifyRules && verifyRules.changeFn && verifyRules.changeFn[ruleName]) {  //手写验证事件的校验
                        errorMsg = verifyRules.changeFn[ruleName]({
                            productData: vProductData,
                            insData: ins,
                            eleData: ele
                        }, vData.planbookData)
                    }
                })
            })
        }
        vData.errorMsg = errorMsg
        return errorMsg
    },
    //函数：按产品，计算险种数据
    //参数：
    //cData: 需要计算的数据
    //finishCB: 计算后的回调函数
    calculateInsData: function (cData, finishCB) {
        var self = cData.self
        if (cData.calType != 'autoImport') {  //删除调整保额
            cData.productData.adjustBaoeData && self.$set(cData.productData, 'adjustBaoeData', null)
        }
        var productData = helperJs.convertProductData(cData.productData)
        if (productData.mulInsOrderList.length) {  //是否选择了险种
            productData.mulInsOrderList.map(function (ins) {
                if(ins.shmInsData) {
                    delete ins.shmInsData
                }
                if (cData.calType != 'autoImport') {  //删除追加领取数据
                    ins.accountData && self.$set(ins.accountData, 'addAndTakeData', [])
                    ins.reduceBaof && self.$set(ins, 'reduceBaofData' , null)
                }
                if (pBType === 'as_planbook' && !productData.inputResultSwitch && ins.inputResult !== undefined) {
                    ins.inputResult = ''
                }
            })

            var reqData = {
                insuranceTypeId: planbookId,
                personData: helperJs.convertPersonData(cData.planbookData.personData),  //转换后的个人信息数据
                productGroupList: [
                    {
                        key: cData.groupData.key,
                        prodOrderList: [productData],  //转换后的产品数据
                    }
                ]
            }

            helperJs.vueAxios({  //请求计算
                self: self,
                url: allApiUrl.calculateDataApi,
                data: qs.stringify({
                    jd: JSON.stringify(reqData),
                    signature: createMd5Token(reqData)
                })
            }, function (res) {
                if (res.data.success) {
                    debugger
                    var productGroup = res.data.data.productGroupList[0]  //返回的产品数据
                    productGroup.prodOrderList.map(function (prod) {
                        cData.$set = self.$set
                        helperJs.receiveProductData(cData, [cData.groupData.key, cData.productData.key], prod)
                    })
                    finishCB && finishCB()
                } else {
                    cData.productData.hadChoice = false
                    cData.productData.insShowArr = []
                    self.$toast(res.data.info)
                }
            })
        } else {
            self.$toast("请选择险种")
        }
    },


    //函数: 生成计划书方法调用
    //参数：
    makePlanbook: function (obj) {  //生成结果页
        var self = obj.self;
        var btnEle = event && event.target
        if (btnEle && btnEle.classList.contains('disabled')) {
            return
        }

        var allMainInsData = self.planbookData.productGroupList.filter(function(ins){ return ins.key == 'allMainInsData' })[0]
        if (allMainInsData.prodOrderList.some(function (ele) {
            return !!ele.hadChoice && !ele.hide
        })){
            var resultData = {  //生成计划书的请求数据
                pbType: obj.resultType || pBType || '',
                insuranceTypeId: planbookId,
                companyId: self.planbookData.companyId,
                recordSetting: self.planbookData.recordSetting,
                totalBaof: self.totalBaof * 1,
                personData: helperJs.convertPersonData(self.planbookData.personData),
                productGroupList: [],
                theme: self.planbookData.theme,
                coverId: self.planbookData.coverId,
                commonData: self.planbookData.commonData,
                displayFormatSort: self.planbookData.displayFormatSort,
                categorySort: self.planbookData.categorySort,
                title: self.planbookData.title || document.title,
                userUuid: helperJs.getUrlParam('userUuid')
            }

            //针对保单整理：有家庭成员，则根据成员id取成员姓名
            if (helperJs.isObjExist(resultData, ['personData', 'personOrderList']) && helperJs.isObjExist(self, ['allInputData', 'planbookData', 'personData', 'personOrderList'])) {
                resultData.personData.personOrderList.map(function (person, pi) {
                    var rawPersonInfo = helperJs.getArraySubEle(self.allInputData.planbookData.personData.personOrderList, 'key', 'applicantInfo')
                    var eleMemberId = helperJs.getArraySubEle(rawPersonInfo.eleOrderList, 'key', 'activeMemberId')
                    if (person.key === 'applicantInfo' && eleMemberId) {
                        person.name = helperJs.getArraySubEle(eleMemberId.opts, 'cid', person.activeMemberId).name
                    }
                })
            }

            self.planbookData.productGroupList.map(function (group) {  //生成产品组的数据
                var productGroup = {
                    key: group.key,
                    prodOrderList: []
                }
                group.prodOrderList.map(function (prod) {
                    if (!!prod.hadChoice && !prod.hide) {
                        /**
                         * 按顺序，遍历出需要在结果页显示的元素
                         * @Author   Lizh
                         * @DateTime 2019-10-23
                         * @param    {[type]}   ele [description]
                         * @return   {[type]}       [description]
                         */
                        prod.mulInsOrderList.map( (ins, iIdx, multIns) => {
                            ins.eleOrderInResult = []
                            let refInsuranceData
                            if (ins.refInsuranceId && ins.refInsuranceId != -2) { //-2，关联自身
                                if (ins.refInsuranceId == -1) {  //关联主险
                                    refInsuranceData = multIns[0].key == 'common' ? multIns[1] : multIns[0]
                                } else {
                                    refInsuranceData = helperJs.filterArr(multIns, ins.refInsuranceId)
                                }
                            }
                            ins.eleOrderList && ins.eleOrderList.map( ele => {
                                //取关联元素
                                let refElementData = refInsuranceData && refInsuranceData.eleOrderList && refInsuranceData.eleOrderList.filter(e => e.key === ele.key)[0]
                                if (['title', 'calMethod', 'customRate'].indexOf(ele.key) === -1 && (!ele.isHide || (ele.isHide && !ele.isDisabled && refElementData && !refElementData.isHide))) {
                                    ins.eleOrderInResult.push({
                                        value: ele.key,
                                        label: ele.labelName
                                    })
                                }
                            })
                        })

                        var productData = helperJs.convertProductData(prod)
                        productData.mulInsOrderList.map(function (ins) {
                            if (ins.huomian == 'shuangHuomian' && ins.shmInsData && ins.shmInsData.title) {
                                productData.mulInsOrderList.push(ins.shmInsData)
                            }
                        })
                        productGroup.prodOrderList.push(productData)
                    }
                })
                resultData.productGroupList.push(productGroup)
            })

            if (btnEle && !btnEle.classList.contains('noDisabled')) {
                btnEle.classList.add('disabled')
            }

            window.WeiyiStatSDK.submit('scjhs', {
                productList: self.planBookData.productGroupList[0].prodOrderList.filter(function (ele) {
                    return ele.hadChoice
                }).map(function (ele) {
                    return ele.key
                }).join()
            })
            return helperJs.vueAxios({
                self: self,
                url: obj.url || allApiUrl.createPlanbookApi,
                data: qs.stringify({
                    jd: JSON.stringify(resultData),
                    userUuid: helperJs.getUrlParam('userUuid'),
                    signature: createMd5Token(resultData)
                })
            }, function (res) {
                var resData = res.data.data;
                if (res.data.success) {
                    if (obj.successFn) {
                        obj.successFn(res)
                    } else {
                        var intellectScheme = localStorage.getItem('intellectScheme') ? JSON.parse(localStorage.getItem('intellectScheme')) : {}
                        intellectScheme['s' + planbookId] = resData
                        localStorage.setItem('intellectScheme', JSON.stringify(intellectScheme))
                        location.href = globalHostName + '/planBook/planBookResult/pages/planbkTemplate.html?nw=1&theme=' + self.planBookData.theme + '&uuid=' + resData + '&coverId=' + self.planBookData.coverId
                        if (location.hostname.search(/localhost|192\.168\./) !== -1) {
                            location.href = location.protocol + '//' + location.hostname + ':8081/pages/planbkTemplate.html?nw=1&theme=' + self.planBookData.theme + '&uuid=' + resData + '&coverId=' + self.inputData.coverId
                        }
                    }
                } else {
                    btnEle && btnEle.classList.remove('disabled')
                }
            })
        } else {
            self.$toast('请选择险种')
            return false
        }
    },


    /*校验同一产品中各险种之间的限制
    参数: me,当前元素的组件
         iData,当前inputData
    */
    verifyProdRestricts: function (me, iData) {
        var helperJs = this
        var aRestricts = me.productData.restrictList
        var personData
        if (iData) {
            personData = helperJs.convertPersonData(iData.personData)
        }
        var insuredInfo
        if (personData && personData.personOrderList) {
            insuredInfo = helperJs.filterArr(personData.personOrderList, 'insuredInfo')
        }

        var errorMsg
        if (aRestricts && aRestricts.length) {
            aRestricts.map(function (r, i) {
                var cProductData = helperJs.convertProductData(me.productData)
                var vRestData = {
                    age: insuredInfo.age,
                    sex: insuredInfo.sex,
                    common: cProductData.common
                }
                cProductData.mulInsOrderList.map(function (ins, i, arr) {
                    vRestData['i' + ins.key] = ins
                })
                r.rCondition = r.rCondition.replace(/(%)(\d+)(\.*\w*)(%)/g, 'vRestData.i$2$3')
                r.rCondition = r.rCondition.replace(/(%)(\w*\.*\w*)(%)/g, 'vRestData.$2')

                var curIns = helperJs.filterArr(me.productData.mulInsOrderList, r.rInsKey)
                var curEle = curIns && helperJs.filterArr(curIns.eleOrderList, r.rEleKey)
                if (curEle) {
                    switch (r.rType) {
                        case 1:  //判断险种是否选中
                            if (eval(r.rCondition)) {
                                curEle.isDisabled = false
                                if (r.other && r.other.indexOf('required') !== -1) {
                                    curEle.value = true
                                    curEle.isDisabled = true
                                }
                            } else {
                                curEle.isDisabled = true
                                if (r.other && r.other.indexOf('optional') !== -1) {
                                    curEle.isDisabled = false
                                }

                                curEle.isDisabled && (curEle.value = false)
                                if (me.insData && me.eleData && r.rCondition.search(me.insData.key + '.' + me.eleData.key) !== -1) {  //如果限制条件元素改变，使目标元素不可选，则改成不选中状态
                                    curEle.value = false
                                }
                            }
                            break;
                        case 2:  //下拉框的选项范围
                            var rangeSelect = eval(r.rCondition)
                            curEle.opts.map(function (opt) {
                                var optNum = helperJs.getValueFromYear(opt.val, vRestData.age)  //当前选项转成数值
                                var rangeSelectNum = rangeSelect.constructor === Array ? [
                                    rangeSelect[0] && helperJs.getValueFromYear(rangeSelect[0], vRestData.age),
                                    rangeSelect[1] && helperJs.getValueFromYear(rangeSelect[1], vRestData.age)
                                ] : helperJs.getValueFromYear(rangeSelect, vRestData.age)

                                if (rangeSelect) {
                                    if (rangeSelect.constructor === Array) {
                                        opt.isHide = (rangeSelect[0] && optNum < rangeSelectNum[0]) || (rangeSelect[1] && optNum > rangeSelectNum[1])
                                    } else {
                                        opt.isHide = optNum > rangeSelectNum
                                    }
                                }
                            })
                            break;
                        case 3:  //输入框的取值范围
                            if ((!me.insData && !me.eleData) ||
                                ((r.rInsKey == me.insData.key && r.rEleKey == me.eleData.key) || (r.rCondition.search('vRestData.i') !== -1 && r.rCondition.search(me.insData.key + '.' + me.eleData.key) !== -1))
                            ) {
                                var rangeVal = eval(r.rCondition)
                                if (rangeVal.constructor === Array) {
                                    if (rangeVal[0] && curEle.value && curEle.value < rangeVal[0]) {
                                        errorMsg = r.rMsg || (curIns.name + '的' + curEle.labelName + '不得小于' + rangeVal[0])
                                    } else if (rangeVal[1] && curEle.value && curEle.value > rangeVal[1]) {
                                        errorMsg = r.rMsg || curIns.name + '的' + curEle.labelName + '不得大于' + rangeVal[1]
                                    }
                                } else if (rangeVal.constructor === String || rangeVal.constructor === Number) {
                                    rangeVal && (curEle.value = rangeVal)
                                }
                            }
                            break;
                    }
                }
            })
        }

        return errorMsg
    },


    /*将交费期间的value值转成数值。保险期间也可用*/
    getValueFromYear: function (v, age) {
        var num
        if (typeof v === 'number') {
            return v
        }
        if (v === 'a1000') {
            num = 1
        } else if (v.match(/^a/)) {
            num = v.replace(/\D/g, '') * 1 - (age || 0)
        } else {
            num =v.replace(/\D/g, '') * 1
        }
        return num
    },


    /*针对保额保费等元素最小值最大值的限制做校验
    参数: me,当前元素的组件
         iData,当前inputData
    */
    verifyInsRestricts: function (me, iData) {
        var helperJs = this
        var oValue = helperJs.convertCalData(me.insData)  //当前险种的信息
        debugger
        var personData = helperJs.convertPersonData(iData.personData).personData  //关于人的信息
        if (personData && personData.personOrderList) {
            var insuredInfo = helperJs.filterArr(personData.personOrderList, 'insuredInfo')
            oValue.sex = insuredInfo.sex
            oValue.age = insuredInfo.age
        }

        var aRestricts = me.eleData.restrictions.filter(function (rest) {  //过滤符合当前数据的限制条件
            return Object.keys(rest).every(function (ele) {
                return (ele === 'age' && oValue[ele] >= rest[ele][0] && oValue[ele] <= rest[ele][1]) ||
                       (ele === me.eleData.key) ||
                       ((rest[ele].constructor === String || rest[ele].constructor === Number) && oValue[ele] === rest[ele]) ||
                       (rest[ele].constructor === Array  && rest[ele].some(function(r){ return r == oValue[ele] }))
            })
        })

        var errorMsg
        if (aRestricts && aRestricts.length) {
            var valRange = aRestricts[0][me.eleData.key]
            if (valRange.length) {
                if (me.eleData.opts) {
                    me.eleData.opts = valRange
                    if (!me.eleData.opts.some(function (opt) { return opt.val == me.eleData.value })) {
                        errorMsg = '当前条件下，没有此' + me.eleData.labelName + '选项, 已自动切换'
                    }
                } else if (me.eleData.optCof && me.eleData.optCof.length && me.eleData.optCof[0] != '') {

                } else if ((valRange[0] && me.eleData.value < valRange[0]) || (valRange[1] && me.eleData.value > valRange[1])) {
                    errorMsg = '当前条件下,' + me.insData.name + '的' + me.eleData.labelName + '值' + (valRange[0] ? ('不得小于 ' + helperJs.getUnitWan(valRange[0])) + (valRange[1] ? ' 且' : ' ') : '') + (valRange[1] ? ('不得大于 ' + helperJs.getUnitWan(valRange[1])) : '')
                }
            }
        }

        return errorMsg
    },

    /*初始化验证规则*/
    initValidateRules: function (self) {
        var validate = {}
        if (['cmCommonInputSever', 'cmCommonInput'].indexOf(self.eleData.componentName) !== -1) {
            self.eleData.required !== false && (validate.required = {
                rule: self.eleData.required !== undefined ? self.eleData.required : true,
                initial: 'off',
                message: '请输入值'
            })
            validate.regExp = {
                rule: self.eleData.regExp ? eval(self.eleData.regExp) : /^\d*$/,
                initial: 'off',
                message: self.eleData.regExpMessage || (self.eleData.regExp ? "输入不合法，请重新输入": "请输入整数值"),
                validator: function (value, rule) { return !value || rule.test(value) }
            }
        }
        if (self.eleData.min !== undefined && self.eleData.min && !isNaN(self.eleData.min)) {
          validate.min = {
            rule: self.eleData.min,
            initial: 'off',
            message: '请输入最小值不小于' + this.getUnitWan(self.eleData.min)
          }
        }
        if (self.eleData.max !== undefined && self.eleData.max && !isNaN(self.eleData.max)) {
          validate.max = {
            rule: self.eleData.max,
            initial: 'off',
            message: '请输入最大值不大于' + this.getUnitWan(self.eleData.max)
          }
        }
        if (self.eleData.multi !== undefined && self.eleData.multi && !isNaN(self.eleData.multi)) {
          validate.multi = {
            rule: self.eleData.multi,
            initial: 'off',
            message: '请输入' + self.eleData.multi + '倍数',
            validator: function(value, rule){
                return !value || !rule || !(value%rule);
            }
          }
        }
        if (self.eleData.compareItem !== undefined && self.eleData.compareItem && self.eleData.compareItem.length) {
            validate.compare = {
                rule: [],
                initial: 'off',
                message: self.eleData.compareItem[3] || '数据输入有误',
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
        var helperJs = this
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
                    var insData0 = me.productData.mulInsOrderList.filter(function(ele) {
                        return ele.key == valArr[0].split('.')[0]
                    })[0]
                    var insData1 = me.productData.mulInsOrderList.filter(function(ele) {
                        return ele.key == valArr[2].split('.')[0]
                    })[0]
                    vmArr[item].validate[k].rule = [
                        insData0 && helperJs.filterArr(insData0.eleOrderList, 'title').value ? helperJs.filterArr(insData0.eleOrderList, valArr[0].split('.')[1].split('*')[0]).value * (valArr[0].split('*')[1] ? valArr[0].split('*')[1] : 1) : 0,
                        valArr[1],
                        insData1 && helperJs.filterArr(insData1.eleOrderList, 'title').value ? helperJs.filterArr(insData1.eleOrderList, valArr[2].split('.')[1].split('*')[0]).value * (valArr[2].split('*')[1] ? valArr[2].split('*')[1] : 1) : 0
                    ]
                }
            }
        }

        vmArr[item].$validate().then(function ($validation){
            if (item === vmArr.length - 1) {
                successFn && successFn()
            }
            $validation.fields[0].$el.querySelector('select, input').style.removeProperty("border-color");
            helperJs.validateAllFn(item + 1, vmArr, me, successFn, faileFn)
        }).catch(function ($validation) {
            console.log($validation)
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

    //函数：获取对象数组中的子元素
    //参数：arr为数组，每个子元素是一个对象；key为对象关键字；val为key对应的值
    getArraySubEle: function (arr, key, val) {
        if (arr && arr.constructor === Array && key !== undefined) {
            var arrObj = arr.filter(function (obj) {
                return typeof obj === 'object' && obj[key] == val
            })
            return arrObj.length <= 1 ? (arrObj[0] || '') : arrObj
        }
    },

    //函数: 将时间对象或时间戳转换成时间字符串
    //参数：时间对象或时间戳
    getDateString: function (d) {
        if (!d) { return }
        if (typeof d === 'number') {
            d = new Date(d)
        }
        return d.getFullYear() + (d.getMonth() + 1 < 10 ? '-0' : '-') + (d.getMonth() + 1) + (d.getDate() < 10 ? '-0' : '-') + d.getDate()
    },
    stopBodyScroll: function  (isFixed) {
        var bodyEl = document.body
        if (isFixed) {
            positionTop = window.scrollY

            bodyEl.style.position = 'fixed'
            bodyEl.style.top = -positionTop + 'px'
            document.documentElement.style.height = window.innerHeight + 'px'
        } else {
            bodyEl.style.position = ''
            bodyEl.style.top = ''
            document.documentElement.style.height = ''

            window.scrollTo(0, positionTop) // 回到原先的top
        }
    },
    parseTime: function(time, cFormat) {
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
        if (('' + time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time);
      }
      const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay(),
      };
      const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === 'a') {
          return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
        }
        if (result.length > 0 && value < 10) {
          value = '0' + value;
        }
        return value || 0;
      });
      return time_str;
    },

    myMixin: {
        data () {
            return {
                pBType,
                window: window
            }
        }
    }
}
export default helperJs