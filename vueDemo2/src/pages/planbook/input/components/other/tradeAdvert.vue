<template>
    <div class="advertMainDiv" v-if="showTradeAdvert || showTradeAdvert2">
        <ul class="advertMainUl">
            <li data-stat-id="xbanner2" v-if="showTradeAdvert">
                <a href="//promotion.winbaoxian.com/tp.html?tp=20309&t=3979654&act_goal=2">
                    <span class="title">中老年专属</span>
                    <span> <em></em> 60岁以上意外医疗保障，放心安心孝心！！</span>
                    <i class="iconfont icon-arrows_right"></i>
                </a>
            </li>
            <li data-stat-id="xbanner2" v-if="showTradeAdvert2">
                <a href="//promotion.winbaoxian.com/tp.html?tp=20261&t=8522448&act_goal=2">
                    <span class="title">少儿专属</span>
                    <span> <em></em> 门诊、住院关爱，乐享童年</span>
                    <i class="iconfont icon-arrows_right"></i>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
  export default {
    name: 'OtherTradeAdvert',
    data () {
      return {
      }
    },
    props: {
        planbookData: Object
    },
    created () {
    },
    computed: {
        showTradeAdvert () {
            let self = this
            if (self.planbookData && self.planbookData.personData && self.planbookData.personData.personOrderList) {
                let insureInfo = self.planbookData.personData.personOrderList[0]
                let ageEle = insureInfo.eleOrderList.filter(ele => ele.key == 'age')[0]
                return ageEle.value >= 60
            } else {
                return false
            }
        },
        showTradeAdvert2 () {
            let self = this
            if (self.planbookData && self.planbookData.personData && self.planbookData.personData.personOrderList) {
                let insureInfo = self.planbookData.personData.personOrderList[0]
                let ageEle = insureInfo.eleOrderList.filter(ele => ele.key == 'age')[0]
                return ageEle.value <= 12
            } else {
                return false
            }
        }
    }
  }
</script>

<style scoped>
    @import 'variables.css';
    .advertMainDiv {
        & .advertMainUl {
            margin-top: 10px;
            & li {
                & a {
                    position: relative;
                    margin: 0 auto;
                    padding: 14px 8% 14px 4%;
                    position: relative;
                    background: #fff;
                    color: #333;
                    border-radius: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    & span {
                        margin-left: 2px;
                        vertical-align: middle;
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
                    }
                }
            }
        }
    }

</style>

