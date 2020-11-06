<template>
  <div class="checkboxEleDiv posRelative clearFloat">
    <!-- 被保人、投保人、投保人配偶 标题 -->
    <label :for="personData.key + '_title'" class="personInfoTitle" :style="{
      color: !elementUiInfo.value && isDisabled? '#ccc':'#333',
      width: isImport? 'auto': '90%'
      }">{{labelName}}
    </label>
    <span class="importBtnPos" @click.stop="ckImportClient" v-if="isImport" data-stat-id="khlbdr" :data-stat-ep='JSON.stringify({"type": personData.key})'>导入客户</i></span>
    <hr>
    <div class="floatRight" v-if="bShow">
      <label class="checkboxRadioLabel">
        <input
          :id="personData.key + '_title'"
          :class="isDisabled?'disabled':''"
          type="checkbox"
          v-model="elementUiInfo.value"
          :disabled="isDisabled?'disabled':null"
          @change="onchange"
          >
          <i class="iconfont" :class="[isDisabled?'disabled':'', elementUiInfo.value?'icon-choose_done_surface':'icon-choose_none_line']"></i>
      </label>
    </div>

  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    export default {
      name: 'cmInfoTitle',
      data () {
        return {
        }
      },
      props: ['personData', 'elementUiInfo'],
      methods: {
        onchange (e) {
          this.elementUiInfo.value = e.target.checked
          this.$emit('relatePersonInfo')
        },
        ckImportClient () {  //导入联系人信息
            let self = this
            if (window.appBridge && appBridge.checkAppFeature('CRM_IMPORT')) {
              appBridge.importContact('recipient') // TODO: 允许的参数列表及其含义
              appBridge.onContactImport((contactInfo) => {

                console.log(contactInfo)
                /** contactInfo 数据格式示例
                 *
                 * addType: 0
                 * cid: ""
                 * contacterAlreadyInServer: false
                 * name: ""
                 * sex: 1
                 * type: "recipient"
                 */

                 let importSuccess = true
                self.personData.cid = contactInfo.cid
                self.personData.eleOrderList.map(function (ele) {
                  if (ele.key == 'age' && contactInfo.birthday) {  //被保人\投保人\投保人配偶导入数据。2019-05-22
                      let age = helperJs.getAgeFromBirth(contactInfo.birthday)
                      let titleNames = {
                        insuredInfo: '被保人',
                        applicantInfo: '投保人',
                        spouseInfo: '投保人配偶'
                      }

                      let sexEle = helperJs.getArraySubEle(self.personData.eleOrderList, 'key', 'sex')
                      let ageOpts = sexEle.value == 2 && ele.optsF ? ele.optsF : ele.opts
                      if (age >= ageOpts[0] && age <= ageOpts[1]) {  //非被保人\投保人\投保人配偶，或者年龄符合时赋值
                        self.personData.birthday = helperJs.getDateString(contactInfo.birthday).replace(/-/g, '/')
                        ele.value = helperJs.getAgeFromBirth(self.personData.birthday)
                      } else {
                        if (titleNames[self.personData.key]) {
                          self.$toast(`${titleNames[self.personData.key]}年龄超出投保范围：${ageOpts[0]}-${ageOpts[1]}岁`)
                          importSuccess = false
                          return
                        }
                      }
                  } else if (ele.key == 'sex' && contactInfo.sex) {
                      if (self.personData.key === 'insuredInfo' && ele.opts && ele.opts.length < 2) {//被保人性别有限制时
                        if (ele.value != contactInfo.sex) {
                          self.$toast(`被保人只能为"${ele.value == 1 ? '男' : '女'}性"`)
                          importSuccess = false
                          return
                        }
                      } else {
                        ele.value = contactInfo.sex
                      }
                  }  else if (ele.key == 'title') {
                      ele.value = true
                  } else {
                      contactInfo[ele.key] && (ele.value = contactInfo[ele.key])
                  }
                })
                importSuccess && self.$emit('relatePersonInfo')
              })
            }
        },
        gotoFamilyPolicy () {
          location.href += `&pbType=familyPlan`
        }
      },
      // watch: {
      //   "elementUiInfo.value" () {
      //       this.$emit('relatePersonInfo')
      //   }
      // },
      computed: {
        labelName () {
          var labelName = '个人信息'
          var oLabelNames = {
            insuredInfo: '被保人信息',
            applicantInfo: '投保人信息(豁免相关)',
            spouseInfo: '投保人配偶信息(双豁免相关)',
            recipientInfo: '封面信息'
          }

          if (this.elementUiInfo && this.elementUiInfo.labelName) {
            labelName = this.elementUiInfo.labelName
          } else if (oLabelNames[this.personData.key]) {
            labelName = oLabelNames[this.personData.key]
          }
          return labelName
        },
        bShow () {
          var bShow = true
          if (this.elementUiInfo && this.elementUiInfo.isShowCheckbox !== undefined) {
            bShow = this.elementUiInfo.isShowCheckbox
          } else {
            bShow = this.personData.key !== 'insuredInfo'
          }
          return bShow
        },
        isDisabled () {
          return this.elementUiInfo.isDisabled
        },
        isImport () {
          return window.appBridge && appBridge.isApp() && this.elementUiInfo.isImport && !pBType
        },
        bShowFamilyBD () {
          return !pBType && this.personData.key === 'insuredInfo'
        }
      },
    }
</script>

<style scoped>
    @import 'variables.css';
    .checkboxEleDiv {
      position: relative;
      & hr {
        position: absolute;
        top: 24px;
        left: -30px;
        width: 8px;
        height: 30px;
        border: none;
        background-color: #508CEE;
      }
      & .personInfoTitle {
        display: inline-block;
        color: #333;
        vertical-align: middle;
        font-weight: 500;
        font-size: 34px;
        font-weight: bold;
        @mixin nowrap;
      }
      & .importBtnPos {
        display: inline-block;
        vertical-align: top;
        margin-left: 20px;
        font-size: 26px;
        vertical-align: middle;
        color: var(--mainColor_blue);
      }
      & .familyPBSpan {
        position: absolute;
        top: 10px;
        right: 0;
        display: inline-block;
        height: 56px;
        line-height: 56px;
        padding: 0 20px;
        border: 1px solid var(--gray_e5);
        border-radius: 2px;
        font-size: 26px;
        background: #fff;
      }
      & .disabled {
        color: #D2DFFE!important;
      }

    }
</style>
