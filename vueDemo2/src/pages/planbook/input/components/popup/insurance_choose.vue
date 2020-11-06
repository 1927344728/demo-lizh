<template>
    <div class="insChooseMainPopupDiv" @click="ckClosePopup">
        <div class="mainContentDiv" @click.stop="" v-if="productData && isLoaded">
            <header>
                <em>{{productData.titleName}}</em>
                <i class="iconfont icon-close_line" @click="ckClosePopup"></i>
            </header>
            <div class="insChooseDiv" :product-code="productData.key">
                <section class="defined_result" v-if="pBType === 'as_planbook' || pBType === 'as_insurance'">
                    <div class="defined_result_title">
                        <span class="defined_result_title_text" @click="showInputResultDetail = !showInputResultDetail">自定义保费</span>
                        <i class="iconfont" :class="showInputResultDetail ? 'icon-arrows_up' : 'icon-arrows_down'" @click="showInputResultDetail = !showInputResultDetail"></i>
                        <bxs-switch
                            class="defined_result_switch"
                            v-model="checked"
                            @change="changedInputResult"
                        />
                    </div>
                    <div class="defined_result_cont" v-if="showInputResultDetail">
                        <p>保险公司会因非标准体等原因修改费率。</p>
                        <p>打开"自定义保费"功能，按保单填写实际保费/保额</p>
                    </div>
                </section>
                <template v-for="(ins, idx) in productData.mulInsOrderList">
                    <transition-group name="list" tag="ul" :style="{ 'margin-top': ins.isFollowing ? '0' : '0.625rem' }" v-if="!ins.groupKey" :ins-code="ins.key">
                        <li
                        v-for="(ele, lix) in ins.eleOrderList"
                        class="list-item"
                        v-if="!ele.isHide && (
                        ins.key=='common' ||
                        ele.key == 'title' ||
                        ( helperJs.filterArr(ins.eleOrderList, 'title') && helperJs.filterArr(ins.eleOrderList, 'title').value )
                        )"
                        :insurance-code="ins.key"
                        :key="ele.key"
                        :style="{
                        'border-top': lix == 0 && ins.isFollowing?'1px solid #e5e5e5':'none',
                        'padding-bottom': (lix == 0 && (helperJs.filterArr(ins.eleOrderList, 'title') && helperJs.filterArr(ins.eleOrderList, 'title').value))?'0.375rem':'auto'}"
                        >
                            <component
                            :is="ele.componentName"
                            :ele-data="ele"
                            :ins-data="ins"
                            :product-data="productData"
                            @changeEleData="changeEleData"
                            ></component>
                        </li>
                    </transition-group>
                </template>
                <p class="tips" v-if=" (!pBType || pBType === 'multPBCompare') && productData.incompleteRate">若无需要的投保方式，请点击右上角反馈</p>
            </div>
            <footer class="popupOkBtn" data-stat-id="XZBJ_QD" @click="ckPopupOkFn">
                <span>确定</span>
            </footer>
        </div>
    </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import {
        baseApiPath,
        pBType
    } from '@/utils/index'

    import cmCommonTitle       from '../atomComponentsv2/common_form_title.vue'
    import cmCommonTitleSwitch from '../atomComponentsv2/common_form_title_switch.vue'
    import cmCommonInput       from '../atomComponentsv2/common_form_input.vue'
    import cmCommonRadioBtn    from '../atomComponentsv2/common_form_radio_btn.vue'
    import cmCommonRadio       from '../atomComponentsv2/common_form_radio.vue'
    import cmCommonCheckbox    from '../atomComponentsv2/common_form_checkbox.vue'
    import cmCommonSelect      from '../atomComponentsv2/common_form_select.vue'

    export default {
        name: 'PopupInsuranceChoose',
        data () {
            return {
                isLoaded: false,
                backUpData: helperJs.deepCopy({}, this.planbookData),
                showInputResultDetail: true,
                checked: false,
                pBType,
                helperJs
            }
        },
        props: ['planbookData'],
        created () {
            let self = this
            if (self.productData) {
                self.initDefineInputResult()
                helperJs.analysisCondition(self.productData, this.extendData.verifyData, self.planbookData)
                helperJs.valideProd({
                    inputData: self.planbookData,
                    productData: self.productData
                }, true)  //出错时，继续验证
                self.isLoaded = true
            } else {
                self.getNewProdsData()
            }

            helperJs.stopBodyScroll(true)
        },
        methods: {
            getNewProdsData () {
                let self = this
                helperJs.vueAxios({  //初始化数据
                    self,
                    type: 'get',
                    url: `${baseApiPath}/planBook/productTemp/getTempProduct/${self.popupData.relatedProduct[1]}`
                }, function(res) {
                    if (res.data.success && res.data.data) {
                        let newList = res.data.data.initData.inputData.productGroupList[0].prodOrderList
                        self.productData = helperJs.filterArr(newList, self.popupData.relatedProduct[1])
                        self.initDefineInputResult()


                        if (self.productData.mulInsOrderList.some(function(ins) {  //vue中追踪踪数据，必需用$set方法实现数据和页面的绑定
                            return ins.adjustBaoe
                        })) {
                            self.$set(self.productData, 'adjustBaoeData', null)
                        }
                        self.productData.mulInsOrderList.map(function(ins) {  //vue中追踪踪数据，必需用$set方法实现数据和页面的绑定
                            if (ins.reduceBaof) {
                                self.$set(ins, 'reduceBaofData', null)
                            }
                            ins.eleOrderList.map(ele => {  //修复isDisabled不绑定，导致组件渲染出错。2018.12.27
                                self.$set(ele, 'isDisabled', ele.isDisabled || null)
                            })
                        })

                        self.groupData.prodOrderList.push(self.productData)
                        helperJs.valideProd({
                            inputData: self.planbookData,
                            productData: self.productData
                        }, true)  //出错时，继续验证
                        for (let k in res.data.data.verifyData) {
                            if (k == self.popupData.relatedProduct[1]) {
                                this.extendData.verifyData[self.productData.key] = res.data.data.verifyData[k]
                            }
                        }
                        helperJs.analysisInitData(self.planbookData, this.extendData.verifyData)
                        newList.map(function (nProd) {
                            helperJs.analysisCondition(nProd, this.extendData.verifyData, self.planbookData)
                        })
                        if (window.appBridge && appBridge.hideLoading) {
                            appBridge.hideLoading()
                        }

                        self.isLoaded = true
                    }
                }, function(res) {
                    self.$toast(res.message);
                });
            },
            initDefineInputResult () {
                let self = this
                if (pBType !== 'as_planbook') {return}
                if (self.productData.inputResultSwitch === undefined) {
                    self.$set(self.productData, 'inputResultSwitch', !!self.productData.inputResultSwitch)
                }
                self.checked = self.productData.inputResultSwitch
                self.productData.mulInsOrderList.map(ins => {
                    let inputResultEle = helperJs.getArraySubEle(ins.eleOrderList, 'key', 'inputResult')
                    if (ins.key !== 'common' && ins.eleOrderList && !inputResultEle) {
                            let labelName = '保费'
                            if (helperJs.getArraySubEle(ins.eleOrderList, 'key', 'calMethod')) {
                                if (helperJs.getArraySubEle(ins.eleOrderList, 'key', 'calMethod').value === 'baof2baoe') {
                                    labelName = '保额'
                                }
                            } else {
                                if (helperJs.getArraySubEle(ins.eleOrderList, 'key', 'baof')) {
                                    labelName = '保额'
                                }
                            }
                            ins.eleOrderList.push({
                                componentName: "cmCommonInput",
                                placeholder: `按照保单填写${labelName}`,
                                isHide: !self.productData.inputResultSwitch,
                                key: "inputResult",
                                labelName: `自定义${labelName}`,
                                inputType: 'text',
                                required: false,
                                regExp: '/^\\d{1,}(\\.\\d{1,2})?$/',
                                regExpMessage: '请输入1-2位小数的值',
                                value: ins.inputResult === undefined ? '' : ins.inputResult
                            })
                    }
                    if (inputResultEle) {
                        inputResultEle.isHide = !self.productData.inputResultSwitch
                    }
                    delete ins.inputResult
                })
            },
            changedInputResult () {
                let self = this
                self.productData.inputResultSwitch = !self.productData.inputResultSwitch
                // if (self.productData.inputResultSwitch) {
                //     self.showInputResultDetail = true
                // }
                self.productData.mulInsOrderList.map(ins => {
                    ins.eleOrderList && ins.eleOrderList.map( ele => {
                        if (ele.key === 'inputResult') {
                            ele.isHide = !self.productData.inputResultSwitch
                        }
                    })
                })
            },
            ckPopupOkFn () {
                var self = this
                helperJs.validateAllFn(0, helperJs.collectValidateVm(self, []), self, function () {
                    let errorMsg = helperJs.valideProd({
                            inputData: self.planbookData,
                            productData: self.productData
                        })
                    if (errorMsg) {  //验证不通过，弹出错误提示
                        self.$toast(errorMsg)
                    } else {
                       helperJs.calculateInsData({
                            self,
                            inputData: self.planbookData,
                            groupData: self.groupData,
                            productData: self.productData
                        }, function () {
                            self.popupData.popupName = ''
                            helperJs.stopBodyScroll(false)
                            let btnSetEle = document.getElementsByClassName('insBtnSetDiv')[0]
                            btnSetEle && btnSetEle.classList.add('positionToBtn')

                            //关闭险种弹框后，需要更新产品列表页数据
                            let insuredInfo = helperJs.convertProductData({inputData: self.planbookData}).personData.personOrderList[0]  //被保人的信息
                            self.$emit('getTempProductList', null, true)
                        })
                    }
                }, function($validation){
                    self.$toast('请输入正确信息')
                    console.log($validation)
                })
            },

            ckClosePopup () {
                this.planbookData.productGroupList = this.backUpData.productGroupList
                let backupGroupData = helperJs.filterArr(this.backUpData.planbookData.productGroupList, this.popupData.relatedProduct[0])
                if (this.groupData.prodOrderList.length > backupGroupData.prodOrderList.length) {
                    delete verifyData[this.productData.key]
                }
                this.popupData.popupName = ''
                this.popupData.relatedProduct = []

                helperJs.stopBodyScroll(false)
            },
            changeEleData (vmEle) {
                let self = this
                if (vmEle.validate) {
                    helperJs.validateAllFn(0, helperJs.collectValidateVm(vmEle, []), vmEle, function () {
                        helperJs.analysisCondition(vmEle.productData, verifyData, self.planbookData)
                        let errorMsg = helperJs.valideProd({
                                inputData: self.planbookData,
                                productData: vmEle.productData,
                                insData: vmEle.insData,
                                eleData: vmEle.eleData
                            })
                        if (errorMsg) {
                            self.$toast(errorMsg)
                            return false
                        }

                        if (vmEle.eleData.key == 'calMethod') {
                            let uiBaoe = helperJs.filterArr(vmEle.insData.eleOrderList, 'baoe')
                            let uiBaof = helperJs.filterArr(vmEle.insData.eleOrderList, 'baof')
                            vmEle.$nextTick(function () {
                                if (vmEle.eleData.value == 'baoe2baof') {
                                    uiBaoe.isHide = false
                                    uiBaof.isHide = true
                                } else if (vmEle.eleData.value == 'baof2baoe') {
                                    uiBaoe.isHide = true
                                    uiBaof.isHide = false
                                }
                                uiBaoe.value = ''
                                uiBaof.value = ''
                            })

                            if (pBType === 'as_planbook') {
                                let labelName = vmEle.eleData.value === 'baof2baoe' ? '保额' :'保费'
                                let uiInputResult = helperJs.filterArr(vmEle.insData.eleOrderList, 'inputResult')
                                if (uiInputResult) {
                                    self.$set(uiInputResult, 'labelName', `自定义${labelName}`)
                                    self.$set(uiInputResult, 'placeholder', `按照保单填写${labelName}`)
                                }
                            }
                        }
                    })
                } else {
                    helperJs.analysisCondition(vmEle.productData, verifyData, self.planbookData)
                    if (window.verifyRules && verifyRules.changeFn && verifyRules.changeFn[vmEle.ruleName]) {
                        let errorMsg = verifyRules.changeFn[vmEle.ruleName](vmEle, self.planbookData)
                        if (errorMsg) {
                            self.$toast(errorMsg)
                            return false
                        }
                    }
                }
            }
        },
        components: {
            cmCommonTitle,
            cmCommonTitleSwitch,
            cmCommonInput,
            cmCommonRadioBtn,
            cmCommonRadio,
            cmCommonCheckbox,
            cmCommonSelect
        },
        computed: {
            extendData () {
                return this.$store.getters.ExtendData
            },
            popupData () {
                return this.$store.getters.PopupData
            },
            groupData () {
                let popupData = this.$store.getters.PopupData
                return helperJs.filterArr(this.planbookData.productGroupList, popupData.relatedProduct[0])
            },
            productData () {
                let popupData = this.$store.getters.PopupData
                let groupData = helperJs.filterArr(this.planbookData.productGroupList, popupData.relatedProduct[0])
                return helperJs.filterArr(groupData.prodOrderList, popupData.relatedProduct[1]) || null
            }

        }
    }
</script>

<style>
    @import 'variables.css';
    .insChooseMainPopupDiv {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        z-index: 200;
        & .mainContentDiv {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 90%;
            background: #F0EFF4;
            padding-bottom: 120px;
            & header {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100px;
                line-height: 100px;
                padding: 0 4%;
                text-align: center;
                font-size: 32px;
                background: #fff;
                color: var(--gray_333);
                z-index: 300;
                border-bottom: 1px solid var(--gray_e5);
                & i {
                    position: absolute;
                    top: 0;
                    right: 2%;
                    padding: 0 2%;
                    font-size: 40px;
                    color: var(--gray_999);
                    vertical-align: top;
                }
            }
            & .insChooseDiv {
                position: absolute;
                top: 100px;
                width: 100%;
                height: 100%;
                padding: 0 3% 240px;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
                & .defined_result {
                    margin-top: 20px;
                    background: #fff;
                    font-size: 30px;
                    color: var(--gray_333);
                    & .defined_result_title {
                        padding: 30px;
                        position: relative;
                        & .defined_result_switch {
                            position: absolute;
                            top: 50%;
                            right: 30px;
                            transform: translateY(-50%);
                            & .bx-switch {
                              position: relative;
                              box-sizing: border-box;
                              width: 51px;
                              height: 31px;
                              outline: 0;
                              border-radius: 40px;
                              background: rgba(0, 0, 0, 0.1);
                              appearance: none;
                              background-clip: content-box;
                              border: 2px solid rgba(0, 0, 0, 0.1);
                              opacity: 1;
                            }

                            & .bx-switch:checked {
                              box-sizing: border-box;
                              background: #508cee;
                              border: none;

                              & + .bx-switch-circle {
                                transform: translateX(21px);
                              }
                            }

                            & .bx-switch-circle {
                              position: absolute;
                              top: 1px;
                              left: 0;
                              width: 27px;
                              height: 27px;
                              border-radius: 9999px;
                              background-color: #fff;
                              box-shadow: 0 3px 2px 0 rgba(0, 0, 0, 0.2);
                              border: 1px solid rgba(0, 0, 0, 0.1);
                              transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
                              background-clip: padding-box;
                              z-index: 100;
                            }

                        }

                        & i {
                            color: var(--gray_ccc);
                        }
                    }
                    & .defined_result_cont {
                        line-height: 135%;
                        padding: 0 30px 30px;
                        color: var(--gray_666);
                        font-size: 28px;
                        & p {
                            margin-bottom: 6px;
                            &:last-child {
                                margin-bottom: 0;
                            }
                        }
                    }
                }
                & ul {
                    margin-top: 20px;
                    padding-left: 4%;
                    background: #fff;
                    & li {
                        padding-right: 4%;
                        &:first-child {
                            padding-top: 12px;
                        }
                        &:last-child {
                            padding-bottom: 12px;
                        }
                    }
                }
                & .tips {
                    margin-top: 18px;
                    padding: 23px 30px;
                    font-size: 26px;
                    color: var(--gray_666);
                    background: #fff;
                }
            }
            & .popupOkBtn {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100px;
                line-height: 100px;
                color: #fff;
                background: #f8f8f8;
                text-align: center;
                z-index: 300;
                font-size: 26px;
                padding-bottom: constant(safe-area-inset-bottom);
                padding-bottom: env(safe-area-inset-bottom);
                box-sizing: content-box;
                border-top: 1px solid var(--gray_e5);
                border-radius: 4px;
                z-index: 220;
                overflow: hidden;
                & span {
                    display: inline-block;
                    width: 94%;
                    height: 70px;
                    line-height: 70px;
                    margin: 16px auto 0;
                    border-radius: 12px;
                    background: var(--mainColor_blue);
                }
            }
        }
    }

    .popupLabel {
        width: 8rem;
        margin-right: 24px;
        @mixin nowrap;
    }
</style>

