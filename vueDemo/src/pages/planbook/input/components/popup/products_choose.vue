<template>
    <div>
        <div class="prodcuts_popup" @click.stop="ckCloseBtn">
            <transition name="slide-bottom" mode="out-in">
                <div class="multistageListContentDiv" @click.stop="" v-show="showPopupContent">
                    <header class="multistageTitle">
                        <span>选择产品</span>
                        <i class="iconfont icon-close_line" @click="ckCloseBtn"></i>
                    </header>
                    <div>
                        <div class="searchPlanbookDiv">
                            <div class="search_input_wrapper" data-stat-id="jrdbkss" @click.stop="gotoSearchUrl">
                                <div class="searchBarDiv">
                                    <i class="iconfont icon-search"></i>
                                    <input type="text" placeholder="搜索产品">
                                </div>
                            </div>
                            <div class="search_tips">
                                <i class="iconfont icon-help"></i>已为您挑选出“{{insuredInfo.sex === 1 ? '男' : '女'}} {{insuredInfo.age}}岁”可投保产品
                            </div>
                        </div>
                        <div class="multistateListDiv" :style="{height: pickerListHeight}">
                            <div class="firstListDiv prodcuts_popup_company">
                                <ul class="firstListUl">
                                    <li v-for="opt in companyOpts" :class="{active: companyId === opt.value}" @click="getSecondOptsList(opt.value)">
                                        <span>{{opt.label}}</span>
                                    </li>
                                </ul>
                            </div>

                            <div class="secondListDiv prodcuts_popup_product" @click.stop>
                                <bxs-default-page v-if="allInputData.tempProdsList && !allInputData.tempProdsList.length" :key="companyId" :text="companyId === -2 ? '您还没有添加过产品哦' : '什么都没有'" style="margin-top: 3rem;"></bxs-default-page>
                                <ul class="secondListUl" v-else>
                                    <li v-for="opt in oftenAddProductList" v-if="companyId === -2" data-stat-id="jrdbksku" :data-stat-ep="JSON.stringify({
                                        cpId: opt.key,
                                        companyId
                                    })">
                                        <h5>{{opt.companyName}}</h5>
                                        <div class="product_name" v-for="prod in opt.tempProdsList" @click="chooseTarget(prod)">
                                            <span :style="{maxWidth: prod.trade ? '75%' : '100%'}">{{prod.titleName}}</span>
                                            <em v-if="prod.trade">在线投保</em>
                                        </div>
                                    </li>
                                    <li v-for="opt in allInputData.tempProdsList" v-if="companyId !== -2" data-stat-id="jrdbksku" :data-stat-ep="JSON.stringify({
                                        cpId: opt.key,
                                        companyId
                                    })" @click="chooseTarget(opt)">
                                        <span :style="{maxWidth: opt.trade ? '75%' : '100%'}">{{opt.titleName}}</span>
                                        <em v-if="opt.trade">在线投保</em>
                                    </li>
                                    <li class="no_more" v-if="companyId !== -2 && allInputData.tempProdsList && allInputData.tempProdsList.length > 10">没有更多了</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <transition name="slide-fade" mode="out-in">
            <component
                :is="showProductsSearch"
                :all-input-data="allInputData"
                :group-type-opts="groupTypeOpts"
                @closeProductsChoose="ckCloseBtn"
            ></component>
        </transition>
    </div>
</template>

<script>
    import '@babel/polyfill'
    import BScroll from 'better-scroll'
    import helperJs from '@/utils/helper'
    import {
        baseApiPath,
        planbookId,
        pBType

    } from '@/utils/index'
    import ProductsSearch from './products_search.vue'
    export default {
        name: 'ProductsChoose',
        components: {
            ProductsSearch
        },
        data () {
            return {
                inputData: this.allInputData.inputData,
                pickerListHeight: 0,
                companyOpts: this.allInputData.companyOpts || [],
                companyId: -2,
                showProductsSearch: '',
                helperJs,
                showPopupContent: false,

                BScrollProduct: null
            }
        },
        props: {
            allInputData: {
                type: Object,
                default () {
                    return {}
                }
            },
            groupTypeOpts: Array
        },
        created () {
            this.getComanyList()
            helperJs.stopBodyScroll(true)
        },
        mounted () {
            this.showPopupContent = true
            this.$nextTick(() => {
                this.getPickerListHeight()
                this.$nextTick(() => {
                    new BScroll('.prodcuts_popup_company', {
                        scrollY: true,
                        click: true
                    })
                })
            })
        },
        updated () {
            this.getPickerListHeight()
        },
        methods: {
            getPickerListHeight () {
                this.pickerListHeight =
                window.innerHeight * 0.9
                - (document.getElementsByClassName('multistageTitle')[0] && document.getElementsByClassName('multistageTitle')[0].offsetHeight || 0)
                - ((document.getElementsByClassName('searchPlanbookDiv')[0] && document.getElementsByClassName('searchPlanbookDiv')[0].offsetHeight) || 0)
                + 'px'
            },
            getComanyList () {
                if (this.allInputData.companyOpts) {
                    this.getTempProductList('init')
                } else {
                    helperJs.vueAxios({
                        self: this,
                        type: 'get',
                        url: `${baseApiPath}/planBook/V2/tempProduct/companyList`,
                        data: {
                            companyId: this.allInputData.companyId  //排序最前
                        }
                    }, res => {
                        if (res.data.success && res.data.data) {
                            let extendTags = [{
                                label: "我添加过",
                                value: -2
                            }]
                            if (pBType !== 'familyv3') {
                                extendTags.push({
                                    label: "推荐",
                                    value: -1
                                })
                            }
                            this.companyOpts = extendTags.concat(res.data.data)
                            this.$set(this.allInputData, 'companyOpts', this.companyOpts)
                            this.getTempProductList('init')
                        }
                    });
                }
            },
            getTempProductList (type) {
                let self = this
                var insuredInfo = helperJs.convertProductData({inputData: self.inputData}).personData.personOrderList[0]  //被保人的信息
                self.$emit('getTempProductList', {
                    insuranceTypeId: planbookId,
                    companyId: self.companyId === -1 ? self.allInputData.companyId : self.companyId,
                    age: insuredInfo.age,
                    sex: insuredInfo.sex,
                    recommend: self.companyId === -1,
                    oftenAdd: self.companyId === -2
                }, null, () => {
                    if (type === 'init' && !self.allInputData.tempProdsList.length) {
                        if (self.companyId === -2) {
                            self.companyId = pBType === 'familyv3' ? self.allInputData.userCompnayId : -1
                            if (this.allInputData.companyOpts && !this.allInputData.companyOpts.some(comp => comp.value === self.companyId)) {
                                self.companyId = this.allInputData.companyOpts[1].value
                            }
                            self.getTempProductList('init')
                        } else if (self.companyId === -1) {
                            self.companyId = self.allInputData.companyId
                            if (this.allInputData.companyOpts && !this.allInputData.companyOpts.some(comp => comp.value === self.companyId)) {
                                self.companyId = this.allInputData.companyOpts[2].value
                            }
                            self.getTempProductList()
                        }
                    }
                    self.$nextTick(() => {
                        if (!this.BScrollProduct && this.allInputData.tempProdsList.length) {
                            this.BScrollProduct = new BScroll('.prodcuts_popup_product', {
                                scrollY: true,
                                click: true
                            })
                        }
                        if (this.BScrollProduct && this.allInputData.tempProdsList.length) {
                            self.BScrollProduct && self.BScrollProduct.refresh()
                        }
                    })
                })
            },
            gotoSearchUrl () {
                this.showProductsSearch = 'ProductsSearch'
            },
            getSecondOptsList (id) {
                this.companyId = id
                this.getTempProductList()
            },
            chooseTarget (opt) {
                if (this.productNum >= 10) {
                    this.$toast('最多选择10款产品')
                } else {
                    let prodData = this.allInputData.tempProdsList.filter(ele => ele.key == opt.key)[0]
                    this.allInputData.popupData.relatedProduct = [this.inputData.productGroupList[0].key, opt.key]
                    this.allInputData.popupData.popupName = prodData && prodData.componentName || 'PopupInsuranceChoose'
                }
                this.ckCloseBtn()
            },
            ckCloseBtn () {
                helperJs.stopBodyScroll(false)
                this.$parent.showProductsChoose = false
            }
        },
        computed: {
            productNum () {
                let num = 0
                this.inputData.productGroupList.map(function (group) {
                    num += group.prodOrderList.filter(function(prod){return !prod.hide && !!prod.hadChoice}).length
                })
                return num
            },
            insuredInfo () {
                return helperJs.convertProductData({inputData: this.inputData}).personData.personOrderList[0]
            },
            oftenAddProductList () {
                let oftenAddProductList = []
                this.allInputData.tempProdsList && this.allInputData.tempProdsList.map(prod => {
                    let currentCompany = oftenAddProductList.filter(comp => comp.companyId === prod.companyId)[0]
                    if (!currentCompany) {
                        currentCompany = {
                            companyId: prod.companyId,
                            companyName: prod.companyName,
                            tempProdsList: []
                        }
                        oftenAddProductList.push(currentCompany)

                    }
                   currentCompany.tempProdsList.push(prod)
                })
                return oftenAddProductList
            }
        },
    }
</script>

<style scoped>
    @import 'variables.css';
    .prodcuts_popup {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 199;
        background: rgba(0, 0, 0, 0.4);
        & .multistageListContentDiv {
            position: absolute;
            left: 0;
            top: 10%;
            width: 100%;
            height: 90%;
            background: #F0EFF4;
            box-shadow: 0 -2px 2px 1px rgba(0, 0, 0, 0.15);
            & .multistageTitle {
                position: relative;
                display: -webkit-box;
                border-bottom: 1px solid var(--gray_e5);
                background: #fff;
                padding: 26px 22px;
                color: #333;
                & span {
                    display: -webkit-box;
                    -webkit-box-flex: 1;
                    -webkit-box-pack: center;
                    -webkit-box-align: center;
                    line-height: 46px;
                    font-size: 32px;
                    font-weight: bold;
                }
                & i.icon-close_line {
                    font-size: 48px;
                   @mixin vertical_center;
                    right: 30px;
                    color: var(--gray_ccc);
                }
            }
            & .multistateListDiv {
                display: -webkit-box;
                font-size: 14px;
                background: #fff;
                font-size: 30px;
                & .firstListDiv,
                & .secondListDiv {
                    vertical-align: top;
                    height: 100%;
                    overflow: hidden;
                    width: 35%;
                    &::-webkit-scrollbar {
                        display: none;
                    }
                    & ul {
                        & li {
                            width: 100%;
                            padding: 23px 30px 23px 30px;
                            line-height: normal;
                            border-bottom: 1px solid #fff;
                            border-right: 1px solid #fff;
                            @mixin nowrap;
                        }
                        &.firstListUl {
                            background: #F2F2F2;
                            & li {
                                position: relative;
                                border-bottom: 1px solid var(--gray_e5);
                                border-right: 1px solid var(--gray_e5);
                                &.active {
                                    border-right: none;
                                    color: #508CEE;
                                    background: #fff;
                                }
                            }
                        }
                        &.secondListUl {
                            & li {
                                position: relative;
                                text-overflow: initial;
                                &.active {
                                    color: #508CEE;
                                }
                                & h5 {
                                    padding: 0 0 20px;
                                    font-size: 34px;
                                }
                                & .product_name {
                                    padding: 24px 0;
                                }
                                & span {
                                    display: inline-block;
                                    max-width: 70%;
                                    @mixin nowrap;
                                }
                                & em {
                                    display: inline-block;
                                    padding: 0 0.25rem;
                                    border: 1px solid #FF703E;
                                    color: #FF703E;
                                    font-size: 24px;
                                    border-radius: 4px;
                                    vertical-align: middle;
                                    transform: scale(20/24);
                                }
                                &.no_more {
                                    color: #999;
                                    text-align: center;
                                    font-size: 24px;
                                }
                            }
                        }
                    }
                }
                & .secondListDiv {
                    width: 63%;
                }
            }

            & .searchPlanbookDiv {
                background: #fff;
                & .search_input_wrapper {
                    padding: 14px 30px;
                    & .searchBarDiv {
                        position: relative;
                        padding: 0 0 0 60px;
                        background: #f2f2f2;
                        border-radius: 60px;
                        line-height: normal;
                        pointer-events: none;
                        & i.icon-search {
                            position: absolute;
                            top: 50%;
                            left: 16px;
                            transform: translateY(-50%);
                            color: #999;
                            font-size: 36px;
                        }
                        & input {
                            width: 100%;
                            height: 60px;
                            vertical-align: top;
                            border: none;
                            &::-webkit-input-placeholder {
                                color: var(--gray_999);
                            }
                        }
                    }
                }
                & .search_tips {
                    padding: 26px 30px 27px;
                    font-size: 26px;
                    color: var(--gray_666);
                    line-height: normal;
                    background: #fff;
                    border-bottom: 1px solid #e5e5e5;
                    & i {
                        margin-right: 8px;
                        font-size: 30px;
                        vertical-align: middle;
                    }
                }
            }
        }
    }
</style>

