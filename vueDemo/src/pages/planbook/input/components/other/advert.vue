<template>
    <div class="advertMainDiv" id="inputBottomAdvert">
        <ul class="advertMainUl" v-if="advertData && advertData.length">
            <li v-for="adv in advertData" data-stat-id="xbanner" :data-stat-ep='JSON.stringify({"bannerId": adv.id})'>
                <a :href="adv.link">
                    <span class="title" v-if="adv.description">{{adv.description.split('*')[0]}}</span>
                    <span v-if="adv.description && adv.description.split('*')[1]"> <em></em> {{adv.description.split('*')[1]}}</span>
                    <i class="iconfont icon-arrows_right"></i>
                </a>
            </li>
        </ul>
        <PopupAdvert :popup-adverts="popupAdverts" v-if="popupAdverts && popupAdverts.length"></PopupAdvert>
    </div>
</template>

<script>
  import helperJs from '@/utils/helper'
  import {
      baseApiPath,
      planbookId

  } from '@/utils/index'
  import PopupAdvert from '../popup/advert.vue'

  export default {
    name: 'OtherAdvert',
    data () {
      return {
        hadAddStatSDK: false,
        advertList: [],
        advertData: []
      }
    },
    created () {
      let self = this
      helperJs.vueAxios({  //初始化数据
          self: self,
          type: 'get',
          url: `${baseApiPath}/planBook/queryAdvertByUserTag`,
          data: {
              position: 1,
              relationId: planbookId
          },
          withoutLoading: true
      }, function(res) {
          if (res.data.success) {
              if (window.appBridge && appBridge.hideLoading) {
                  appBridge.hideLoading()
              }

              self.advertData = res.data.data && res.data.data.length && res.data.data.filter(ele => ele.type != 2)[0] ? [res.data.data.filter(ele => ele.type != 2)[0]] : []
              self.advertList = res.data.data || []
              if (self.advertData.length) {
                  setTimeout(function () {
                    self.submitStatSDK()
                  }, 3000)
              }
          }
      });
    },
    mounted () {
      window.addEventListener('scroll',  () => {
          this.submitStatSDK()
      });
      document.addEventListener('touchmove',  () => {
          this.submitStatSDK()
      })
    },
    props: [],
    methods: {
      submitStatSDK () {
        if (this.advertData.length && !this.hadAddStatSDK && this.isElementInViewport()) {
          console.log('加埋点')
            this.hadAddStatSDK = true
            window.WeiyiStatSDK.submit('xbanner_visible', {
                'bannerId': this.advertData[0] && this.advertData[0].id
            })
        }
      },
      isElementInViewport (el) {
          let advertEl = document.getElementById('inputBottomAdvert')
          var rect = advertEl.getBoundingClientRect();
          return (
              rect.top >= 0 &&
              rect.left >= 0 &&
              rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - (document.getElementsByClassName('createPlanbookDiv')[0] ? document.getElementsByClassName('createPlanbookDiv')[0].clientHeight : 0) && /*or $(window).height() */
              rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
          );
      }
    },
    components: {
      PopupAdvert
    },
    computed: {
      popupAdverts () {
        return this.advertList.filter(ele => ele.type == 2)
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

