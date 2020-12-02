<template>
    <div class="showInsDataDiv">
        <!-- 所选险种数据展示  -->
        <header class="showInsDataHeader">
            <span class="insurance_title">
                {{ pBType === 'multCompare' ? `推荐添加`: (groupData.titleName || (groupData.key=='allMainInsData'?'险种选择':'附加险选择'))}}
            </span>
            <span class="more_recommend" v-if="showRecommendBtn && !pBType">
                更多健康险产品推荐
                <i class="iconfont icon-arrows_right"></i>
            </span>
           <img v-if="showRecommendTip" src="//img.winbaoxian.com/autoUpload/planbook/planbook_recommend_tip_41701cd8c528a4d.png" alt="" class="tips_recommend">
            <hr>
        </header>
        <div class="input_planbook_sale_status" v-if="planbookData.saleStatus === 2" @click="gotoAnnualSurvey">
            <span>温馨提示</span>
            <span>产品已停售，对已有保单进行整理</span>
            <i class="iconfont icon-arrows_right"></i>
        </div>
        <bxs-default-page v-if="pBType == 'multCompare' && groupData.prodOrderList.length <= 0"></bxs-default-page>
        <template v-for="(prod, idx) in groupData.prodOrderList" v-if="groupData.prodOrderList.length > 0 && !prod.hide && (!!prod.hadChoice || (groupData.defNum && idx < groupData.defNum))">
            <component
                is="ShowTable"
                :planbook-data="planbookData"
                :group-data="groupData"
                :product-data="prod"
                :product-name="[groupData.key, prod.key]"
            ></component>
            <template v-for="(ins, insIdx) in prod.mulInsOrderList">
                <component
                is="AdjustBaoe"
                :group-data="groupData"
                :prod-data="prod"
                :ins-data="ins"
                v-if="prod.hadChoice && helperJs.filterArr(ins.eleOrderList, 'title') && helperJs.filterArr(ins.eleOrderList, 'title').value && !ins.groupKey && getMainIns(prod.mulInsOrderList).key == ins.key && containAdjustBaoe(prod.mulInsOrderList)"
                ></component>
            </template>
            <template v-for="(ins, insIdx) in prod.mulInsOrderList">
                <component
                is="ReduceBaof"
                :group-data="groupData"
                :prod-data="prod"
                :ins-data="ins"
                v-if="prod.hadChoice && helperJs.filterArr(ins.eleOrderList, 'title') && helperJs.filterArr(ins.eleOrderList, 'title').value && ins.reduceBaof && !ins.groupKey"
                ></component>
            </template>
            <template v-for="(ins, insIdx) in prod.mulInsOrderList">
                <component
                is="AddTake"
                :group-data="groupData"
                :prod-data="prod"
                :ins-data="ins"
                v-if="prod.hadChoice && helperJs.filterArr(ins.eleOrderList, 'title') && helperJs.filterArr(ins.eleOrderList, 'title').value && ins.accountData && !ins.groupKey"
                ></component>
            </template>
        </template>
        <div class="insBtnSetDiv" v-if="(productNum || !groupData.defNum) && pBType !== 'video' && pBType !== 'multCompare' && pBType !== 'record'">
            <em @click="collectScheme" v-if="!pBType && !schemeUuid" data-stat-id="scfa">
                <i class="iconfont icon-add"></i>
                收藏方案
            </em>
            <em @click="ckAddPopupFn" data-stat-id="jrdbk">
                <i class="iconfont icon-add"></i>
                {{groupData.btnName || '添加主险／附加险'}}
            </em>
        </div>
    </div>
</template>

<script>
    import { isProduct } from '@/utils/index'
    import helperJs from '@/utils/helper'
    import {
        baseApiPath,
        pBType,
        schemeUuid

    } from '@/utils/index'
    import ShowTable from './show_table.vue'

    export default {
        name: 'ShowProductsData',
        components: {
            ShowTable,
            AddTake: () => import('./add_take.vue'),
            ReduceBaof: () => import('./reduce_baof.vue'),
            AdjustBaoe: () => import('./adjust_baoe.vue')
        },
        data () {
            return {
                schemeUuid,
                pBType,
                showRecommendBtn: false,
                showRecommendTip: false,
                helperJs
            }
        },
        created () {
            var self = this
            if (!self.planbookData.compareData) {
                self.$set(self.planbookData, 'compareData', {
                    compareArr: []
                })
            }

            // if (self.allInputData.companyId !== self.allInputData.userCompnayId) {
            //     self.showRecommendBtn = true
            //     if (!localStorage.getItem('pbRecommendTips')) {
            //         self.showRecommendTip = true
            //         localStorage.setItem('pbRecommendTips', 1)
            //         setTimeout(() => {
            //             self.showRecommendTip = false
            //         }, 3000)
            //     }
            // }
        },
        props: ['planbookData', 'groupData'],
        updated () {
            let self = this
            self.groupData.prodOrderList.map(function (prod) {
                prod.mulInsOrderList.map(function (ins) {
                    if ((!prod.hadChoice || !helperJs.filterArr(ins.eleOrderList, 'title') || !helperJs.filterArr(ins.eleOrderList, 'title').value) && ins.accountData) {
                        self.$set(ins.accountData, 'addAndTakeData', [])
                    }
                })
            })

            let btnSetEle = document.getElementsByClassName('insBtnSetDiv')[0]
            if (btnSetEle && btnSetEle.classList.contains('positionToBtn')) {
                btnSetEle.scrollIntoView()
            }
        },
        methods: {
            gotoAnnualSurvey() {
                location.href = `https://policy-inspection.winbaoxian.${isProduct ? 'com' : 'cn'}/annualSurvey/index.html`
            },
            collectScheme () {
                let self = this
                var btnEle = event && event.target
                helperJs.makePlanbook({
                    self: this,
                    url: `${baseApiPath}/planBook/insureScheme/save`,
                    successFn: function (res) {
                        if (res.data.success) {
                            btnEle && btnEle.classList.remove('disabled')
                            window.scrollTo(0, 0)
                            self.$toast({
                              message: '收藏成功，请到我的方案库中查看',
                              icon: '',
                              duration: 1000
                            })
                        }
                    }
                })
            },
            ckAddPopupFn () {
                let pList = this.groupData.prodOrderList
                if (this.productNum >= 10) {
                    this.$toast('最多选择10款产品')
                } else {
                    this.$set(this.popupData, 'relatedProduct', [this.groupData.key])
                    this.$emit('openProductsChoose')
                }
            },
            getMainIns (insList) {
                for (let ins of insList) {
                    if (ins.key !== 'common') {
                        return ins
                    }
                }
            },
            containAdjustBaoe (insList) {
                return insList.some(function (ins) {
                    return ins.adjustBaoe
                })
            }
        },
        computed: {
            extendData () {
                return this.$store.getters.ExtendData
            },
            popupData () {
                return this.$store.getters.PopupData
            },
            hasMainProduct () {
                let mainProduct = helperJs.isObjExist(this.planbookData.productGroupList, [0, 'prodOrderList', 0])
                let mainInsurance = mainProduct.mulInsOrderList.filter(ins => ins.key !== 'common')[0]
                let eleOrderList  = mainInsurance.eleOrderList
                if (mainProduct && mainProduct.hadChoice && eleOrderList) {
                    let titleElement = helperJs.filterArr(eleOrderList, 'title')
                    return titleElement && titleElement.value
                } else {
                    return false
                }
            },
            productNum () {
                let num = 0
                this.planbookData.productGroupList.map(function (group) {
                    num += group.prodOrderList.filter(function(prod){return !prod.hide && !!prod.hadChoice}).length
                })
                return num
            },
            totalBaof: function () {
                var self = this;
                let totalBaof = 0  //所有产品的保费和
                self.planbookData.productGroupList.map(function (group) {
                    if (!group.isHide) {
                        group.prodOrderList.map(function(prod){
                            if (prod.hadChoice) {
                                totalBaof += prod.totalBaof * 1 || 0
                            }
                        })
                    }
                });
                self.$set(self.planbookData, "totalBaof")
                return totalBaof.toFixed(2)
            }
        }
    }
</script>

<style>
    @import 'variables.css';
    .showInsDataDiv {
        position: relative;
        margin: 18px auto 0;
        padding-bottom: 20px;
        background: #fff;
        border-radius: 8px;
        font-size: 26px;
        & .showInsDataHeader {
            position: relative;
            margin-top: 12px;
            padding: 18px 0 18px 30px;
            line-height: normal;
            & .insurance_title {
                color: #333;
                font-size: 34px;
                font-weight: bold;
                vertical-align: middle;
            }

            & .more_recommend {
                position: absolute;
                bottom: 0;
                right: 30px;
                padding: 16px 0;
                color: #FF5000;
                font-size: 24px;
                z-index: 1;
                & i {
                    font-size: 24px;
                    margin-left: 6px;
                }
            }
            & .tips_recommend {
                position: absolute;
                bottom: 60%;
                right: 10px;
                width: 340px;
            }
            & hr {
              position: absolute;
              top: 24px;
              left: 0;
              width: 8px;
              height: 30px;
              border: none;
              background-color: #508CEE;
            }
        }
        & .input_planbook_sale_status {
            position: relative;
            padding: 21px 30px;
            background: #FFFEED;
            & i {
                vertical-align: middle;
                &.icon-inform {
                    color: #FF9900;
                    font-size: 36px;
                }
                &.icon-arrows_right {
                    position: absolute;
                    top: 50%;
                    right: 30px;
                    transform: translateY(-50%);
                    font-size: 24px;
                    color: var(--gray_999);
                }
            }
            & span {
                margin-left: 4px;
                vertical-align: middle;
                color: var(--gray_666);
                font-size: 24px;
                &:first-child {
                    margin-right: 8px;
                    color: #FF9900;
                }
            }

        }
        & .insBtnSetDiv {
            position: relative;
            height: 72px;
            line-height: 72px;
            padding: 0 30px;
            color: #999;
            text-align: right;
            & em {
                display: inline-block;
                line-height: normal;
                padding: 7px 16px;
                color: var(--mainColor_blue);
                vertical-align: middle;
                border: 1px solid var(--mainColor_blue);
                border-radius: 60px;
                & i {
                    font-size: 26px;
                }
                &:first-child {
                    margin-right: 12px;
                    color: #333;
                    border: 1px solid #ccc;
                }
                &:last-child {
                    color: var(--mainColor_blue);
                    border: 1px solid var(--mainColor_blue);
                }
            }
            & .schemeLibrary {
                position: absolute;
                left: 30px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--mainColor_blue);
            }
        }
        &.widthoutBorder {
            border: none;
            border-radius: unset;
            & .showInsDataHeader {
                background: none;
            }
        }
    }

</style>

