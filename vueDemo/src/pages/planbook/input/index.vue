<template>
    <div :style="{
        minHeight: `${window.innerHeight}px`
    }"
    v-if="planbookData"
    >
        <component
            :is="topTips.component"
            :top-tips="topTips"
        ></component>
        <SchemeGuide :top-tips="topTips" v-if="showSchemeGuide"></SchemeGuide>
        <div class="inputMainDiv">
            <OcrImages v-if="tocOcrId"></OcrImages>

            <!-- 被保人、投保人、投保人配偶 信息模块 -->
            <PersonInfo :planbook-data="planbookData"></PersonInfo>

            <!-- 主险及附加险种数据模块 -->
            <template v-for="(group, idx) in planbookData.productGroupList">
                <ShowProductsData
                    :key="group.key"
                    :planbook-data="planbookData"
                    :group-data="group"
                    @openProductsChoose="openProductsChoose"
                ></ShowProductsData>
            </template>

            <!-- 收件人信息模块 -->
            <div class="recipientInfoDiv">
                <InsureInfo
                    v-if="planbookData.personData.recipientInfo"
                    :person-data="planbookData.personData.recipientInfo"
                ></InsureInfo>
            </div>

            <!-- 各特色模块 -->
            <OtherFeature :planbook-data="planbookData" v-if="!pBType"></OtherFeature>


            <!-- 广告位 -->
            <OtherAdvert></OtherAdvert>
            <!-- 推荐交易产品 -->
            <OtherTradeAdvert :person-data="planbookData.personData"></OtherTradeAdvert>
            <!-- 录音设置 -->
            <RecordSetting :record-setting="extendData.recordSetting" v-if="pBType === 'record'"></RecordSetting>

            <AudioPlanbook :planbook-data="planbookData"></AudioPlanbook>

            <div class="slogen">
                <img src="//img.winbaoxian.com/autoUpload/planbook/bxs_slogan_164d5ce17f7c5a1.png">
            </div>

            <!-- 生成计划书按钮 -->
            <CreatePlanbook :planbook-data="planbookData"></CreatePlanbook>

            <!-- 产品弹框组件 -->
            <transition name="slide-fade" mode="out-in">
                <component
                    :is="popupData.popupName"
                    :planbook-data="planbookData"
                    @getTempProductList="getTempProductList"
                ></component>
            </transition>

            <ProductsChoose
                v-if="showProductsChoose"
                @getTempProductList="getTempProductList"
            ></ProductsChoose>

            <div v-if="!isLoaded" data-stat-id="JHS_LOADING" class="white_mask"></div>
            <span class="choose_scheme" :style="{
                top: topTips.component ? '2.8125rem' : '1.25rem'
            }" @click="gotoSchemeList" v-if="!pBType && !schemeUuid" data-stat-id="fak">
                <em>方案库</em>
            </span>
        </div>
    </div>
</template>

<script>
import {
    getPlanBookInitData
} from '@/api/planbook'
import helperJs from '@/utils/helper'
import {
    baseApiPath,

    planbookId,
    pBType,
    resultUuid,
    schemeUuid,
    storageUuid

} from '@/utils/index'
import Vue from 'vue'

import PersonInfo from './components/person/person_info.vue'
import InsureInfo from './components/person/insure_info.vue'

import ShowProductsData from './components/insurance/show_products_data.vue'
import OtherAdvert from './components/other/advert.vue'
import OtherTradeAdvert from './components/other/tradeAdvert.vue'
import OtherFeature from './components/other/feature.vue'

import CreatePlanbook from './components/footer/create_planbook.vue'

import PopupInsuranceChoose from './components/popup/insurance_choose.vue'
import ProductsChoose from './components/popup/products_choose.vue'

import Bxs from 'bxs-ui-vue'
Vue.use(Bxs)

export default {
    name: 'InputMain',
    components: {
        PersonInfo,
        InsureInfo,

        ShowProductsData,
        OtherAdvert,
        OtherTradeAdvert,
        OtherFeature,

        CreatePlanbook,

        PopupInsuranceChoose,
        ProductsChoose,

        Authentication: () => import('./components/other/authentication.vue'),
        CustomerTrends: () => import('./components/other/customer_trends.vue'),
        OcrImages: () => import('./components/other/ocr_images.vue'),
        AudioPlanbook: () => import('./components/other/audio_planbook.vue'),
        SchemeGuide: () => import('./components/guidance/scheme.vue'),
        RecordSetting: () => import('./components/other/record_setting.vue'),

        PopupResultCover: () => import('./components/popup/result_cover.vue'),
        PopupAddTake: () => import('./components/popup/add_take.vue'),
        PopupAdjustBaoe: () => import('./components/popup/adjust_baoe.vue'),
        PopupReduceBaof: () => import('./components/popup/reduce_baof.vue')

    },
    data () {
        return {
            isLoaded: false,
            showProductsChoose: false,
            schemeUuid: helperJs.getUrlParam('schemeUuid'),
            tocOcrId: helperJs.getUrlParam('tocOcrId'),
            resultType: helperJs.getUrlParam('resultType'),
            showSchemeGuide: !localStorage.getItem('pbSchemeGuide'),
            topTips: {
                component: '', //Authentication:资质认证, CustomerTrends:获客
                authenticationUrl: ''
            },
            pBType,
            window,
        }
    },
    created () {
        let self = this
        helperJs.setBaseAttribute()
        self.intiCommonActionSheet()  //初始化右上角原生按钮
        window.appBridge && appBridge.$on('AppBackToInputPage', () => {
            self.intiCommonActionSheet()
        })

        self.getQualifyPageUrl()
        getPlanBookInitData({
            insuranceTypeId: planbookId
        }).then(res => {
            if (res.success && res.data) {
                document.title = res.data.title  //更新页面标题
                if (window.appBridge && appBridge.checkAppFeature('CHANGE_WEBVIEW_TITLE')){
                    appBridge.changeWebviewTitle(document.title);
                }
                /**
                 * @Author   Lizh
                 * @DateTime 2019-07-01
                 * 新增投被保人是否为同一人选项
                 */
                if ((!pBType || pBType === 'video' || pBType === 'record') && res.data.initData.inputData.personData && res.data.initData.inputData.personData.personOrderList) {
                    var personOrderList = res.data.initData.inputData.personData.personOrderList
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
                    helperJs.changeInitData(res.data, Vue, function () {
                        helperJs.getInitDataFromResult(res.data, Vue, function () {
                            helperJs.initStart(res.data, (iRes) => {
                                self.getStoreData(iRes)
                            })
                        })
                    })
                } else {
                    helperJs.getInitDataFromResult(res.data, Vue, function () {
                        helperJs.initStart(res.data, (iRes) => {
                                self.getStoreData(iRes)
                            })
                    })
                }
            }
        })
    },
    mounted () {
        window.WeiyiStatSDK && window.WeiyiStatSDK.init({
            pageId: 'JHS_XXTX',
            isProduct: !!/pbf\.winbaoxian\.com/.test(window.location.hostname), // [必填] false: 测试环境、true: 正式环境
            heartBeatRate: 1000,
            projectInfo: {
                productId: planbookId * 1,
                url: location.href
            }
        });
    },
    methods: {
        getStoreData (res) {
            this.$store.commit('INIT_EXTEND', res)
            this.$store.commit('INIT_PLANBOOK', res)
            this.isLoaded = true
            this.autoImportData() //自动导入数据
            let recipientInfo = this.planbookData.personData.recipientInfo
            if (recipientInfo) {
                this.$set(recipientInfo, 'coverId', 0)
                this.$set(recipientInfo, 'coverName', '模板1')
                this.$set(this.planbookData, 'coverId', recipientInfo.coverId)
                // if (!recipientInfo.eleOrderList.filter(ele => ele.key === 'planbookName')[0]) {
                //     recipientInfo.eleOrderList.splice(1, 0, {
                //         key: "planbookName",
                //         value: "",
                //         labelName: '计划书名称',
                //         placeholder: '请输入名称',
                //         componentName: 'cmInfoName'
                //     })
                // }
            }
            this.$set(this.planbookData, 'tempProdsList', null)
        },
        getQualifyPageUrl () {
            !localStorage.getItem('pbInput_authentication') && helperJs.vueAxios({
                self: this,
                url: `${location.protocol}//insurance-tech-api.winbaoxian.${location.hostname.search(/pbf\.winbaoxian\.com/) === -1 ? 'cn' : 'com'}/api/qualify/getQualifyPageUrl`,
                type: 'get',
                withoutLoading: true
            }, res => {
                if (res.data.code === 200 && res.data.data && res.data.data.pageUrl) {
                    this.topTips.component = 'Authentication'
                    this.topTips.authenticationUrl = res.data.data.pageUrl + 4
                } else {
                    this.topTips.component = 'Authentication'
                }
            })
        },
        intiCommonActionSheet() {
            let self = this
            let feedbackUrl = location.origin + '/planBook/projectGroup/feedback/index.html?type=0&planbookId=' + planbookId  //意见反馈跳转链接
            if (location.hostname.search(/localhost|192\.168\./) !== -1) {
                feedbackUrl = location.protocol + '//' + location.hostname + ':9200/feedback/index.html?nw=1&type=0&planbookId=' + planbookId
            }
            if (appBridge && appBridge.checkAppFeature('SHOW_NAVIGATION_RIGHT_BUTTON_JUMP')) {
                appBridge.showNavigationRightBtnJump({
                    text: '反馈', // 必填，右上角按钮文字
                    url: feedbackUrl // 必填，普通链接或任意门链接
                })
            }
        },
        autoImportData: function () {  //自动导入数据
            var self = this
            var productGroupList = self.planbookData.productGroupList
            productGroupList && productGroupList.map(function (group) {
                if (!group.isHide) {
                    group.prodOrderList.map(function (prod, pIdx) {
                        if (!prod.hide) {
                            let isAutoImportData = false

                            //如果链接中有结果页uuid或链接中方案库id或缓存中有结果页uuid
                            if (resultUuid || schemeUuid || storageUuid) {
                                //接口返回的数据中是否有该产品
                                if (prod.resultImport) {
                                    isAutoImportData = true
                                }
                            } else {
                                //正常计划书、计划书对比、家庭计划书、视频计划书、双录
                                if (!pBType || ['multPBCompare', 'familyPlan', 'video', 'record'].indexOf(pBType) !== -1) {
                                    //* 产品有自动导入、且不超过默认导入个数
                                    if (prod.autoImport && pIdx < group.defNum) {
                                        isAutoImportData = true
                                    }
                                }
                            }

                            if (isAutoImportData) {
                                let errorMsg = helperJs.valideProd({
                                        planbookData: self.planbookData,
                                        productData: prod
                                    })
                                if (errorMsg) {  //验证不通过
                                    prod.hadChoice = false
                                    prod.hide = group.defNum && pIdx >= group.defNum
                                    prod.totalBaof = 0
                                    delete prod.insShowArr
                                    self.$toast(errorMsg)
                                } else {
                                    helperJs.calculateInsData({
                                        self,
                                        planbookData: self.planbookData,
                                        groupData: group,
                                        productData: prod,
                                        calType: 'autoImport'
                                    })
                                }
                            }
                        }
                    })
                }
            });
        },
        openProductsChoose() {
            this.showProductsChoose = true
        },
        getTempProductList (form, reFilter, cb) {
            if (this.showProductsChoose) {
                if (reFilter) {
                    let choiceProdArr = this.planbookData.productGroupList[0].prodOrderList.filter(ele => ele.hadChoice).map(ele => ele.key)
                    this.planbookData.tempProdsList = this.planbookData.tempProdsList.filter(prod => choiceProdArr.indexOf(prod.key) === -1)
                    cb && cb()
                } else {
                    helperJs.vueAxios({  //初始化数据
                        self: this,
                        type: 'post',
                        url: `${baseApiPath}/planBook/productTemp/list`,
                        data: {...form}
                    }, res => {
                        if (res.data.success) {
                            let choiceProdArr = this.planbookData.productGroupList[0].prodOrderList.filter(ele => ele.hadChoice).map(ele => ele.key)
                            this.planbookData.tempProdsList = res.data.data.filter(prod => choiceProdArr.indexOf(prod.key) === -1)
                            if (form.recommend) {
                                let tempProdIds = this.planbookData.productGroupList[0].prodOrderList.map(ele => ele.key)
                                this.planbookData.tempProdsList = this.planbookData.tempProdsList.filter(ele => tempProdIds.indexOf(ele.key) === -1)
                                this.planbookData.tempProdsList = this.planbookData.productGroupList[0].prodOrderList.filter(ele => !ele.hadChoice).concat(this.planbookData.tempProdsList)
                            }
                            cb && cb()
                        }
                    })
                }
            }
        },
        gotoSchemeList () {
            let  gotoUrl = `../schemeList/schemeList.html?planbookId=${planbookId}&nw=1`
            location.href = gotoUrl
        }
    },
    computed: {
        planbookData () {
            return this.$store.getters.PlanbookData
        },
        popupData () {
            return this.$store.getters.PopupData
        },
        extendData () {
            return this.$store.getters.ExtendData
        }
    }
}
</script>


<style>
    @import 'base_style.css';
    body {
        background: #f2f2f2;
    }
    .inputMainDiv {
        position: relative;
        width: 100%;
        margin-top: 9px;
        padding: 0 10px;
        padding-bottom: constant(safe-area-inset-bottom);
        padding-bottom: env(safe-area-inset-bottom);
        &:after,
        &::after {
            display: block;
            content: " ";
            width: 1px;
            height: 2.0625rem;
            visibility: hidden;
        }
        & .personInfoDiv {
            margin-top: 9px;
        }
        & .recipientInfoDiv {
            margin-top: 9px;
            border-radius: 0.25rem;
            overflow: hidden;
            background: #fff;
        }

        & .slogen {
            margin-top: 32px;
            text-align: center;
            & img {
                width: 42.4%;
                margin: 0 auto;
            }
        }

        & .choose_scheme {
            position: fixed;
            top: 90px;
            right: 0;
            display: block;
            width: 65px;
            height: 27px;
            line-height: 27px;
            color: #fff;
            background: rgba(0, 0, 0, 0.4);
            text-align: center;
            vertical-align: middle;
            border-top-left-radius: 27px;
            border-bottom-left-radius: 27px;
            font-size: 24px;
            z-index: 20;
        }
    }
    .white_mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 101;
    }
</style>
