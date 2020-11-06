<template>
    <div class="input_audio_planbook">
        <ul class="audio_content_ul">
            <li class="noDisabled" data-stat-id="JHS_ST" @click="goToAudioPlanbook">
                <span class="title">视听计划书</span>
                <span> <em></em> 能说会动 直观易懂</span>
                <i class="iconfont icon-arrows_right"></i>
            </li>
        </ul>
    </div>
</template>

<script>
    import helperJs from '@/utils/helper'
  export default {
    name: 'AudioPlanbook',
    data () {
      return {
        resultType: helperJs.getUrlParam('resultType')
      }
    },
    props: ['planbookData'],
    created () {
    },
    mounted () {
    },
    methods: {
        goToAudioPlanbook () {
            let self = this
            if (this.prodChooseNumber != 1) {
                this.$toast("该功能暂不支持组合场景")
                return
            }
            helperJs.makePlanbook({
                self,
                resultType: this.resultType,
                successFn: function (res) {
                    let resData = res.data.data;
                    var intellectScheme = localStorage.getItem('intellectScheme') ? JSON.parse(localStorage.getItem('intellectScheme')) : {}
                    intellectScheme['s' + planbookId] = resData
                    localStorage.setItem('intellectScheme', JSON.stringify(intellectScheme))
                    location.href = `https://pbf.winbaoxian.${/pbf\.winbaoxian\.com/.test(window.location.hostname) ? 'com' : 'cn'}/planbook-innovative/?uuid=${resData}`
                }
            })
        }
    },
    computed: {
        totalBaof: function () {
            let totalBaof = 0  //所有产品的保费和
            this.planbookData.productGroupList.map(function (group) {
                if (!group.isHide) {
                    group.prodOrderList.map(function(prod){
                        if (prod.hadChoice && !prod.hide) {
                            totalBaof += prod.totalBaof * 1 || 0
                        }
                    })
                }
            });
            return totalBaof.toFixed(2)
        },
        prodChooseNumber () {
            let prodChooseNumber = 0  //所有产品的保费和
            this.planbookData.productGroupList.map(function (group) {
                if (!group.isHide) {
                    group.prodOrderList.map(function(prod){
                        if (prod.hadChoice && !prod.hide) {
                            prodChooseNumber ++
                        }
                    })
                }
            });
            return prodChooseNumber
        }
    }
  }
</script>

<style scoped>
    @import 'variables.css';
    .input_audio_planbook {
        & .audio_content_ul {
            margin-top: 10px;
            & li {
                position: relative;
                margin: 0 auto;
                padding: 14px 8% 14px 4%;
                position: relative;
                background: #fff;
                color: var(--gray_333);
                border-radius: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                & span {
                    margin-left: 4px;
                    vertical-align: middle;
                    pointer-events: none;
                    &.title {
                        margin-left: 0;
                        font-weight: bold;
                        color: #ff4f00;
                    }
                    & em {
                      display: inline-block;
                      width: 1px;
                      height: 1.25rem;
                      margin: 0 4px;
                      border: none;
                      border-right: 1px solid #e5e5e5;
                      vertical-align: top;
                    }
                }
                & i {
                    font-size: 14px;
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    margin-top: -9px;
                    pointer-events: none;
                }
            }
        }
    }

</style>

