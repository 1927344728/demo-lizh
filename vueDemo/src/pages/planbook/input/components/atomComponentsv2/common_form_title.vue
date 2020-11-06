<template>
  <div class="posRelative popupTitleDiv clearFloat">
    <!-- 通用的表单 各个险种的标题 -->
    <span class="codeSpanBtn" v-if="insData.code">{{insData.code}}</span>
    <label :for="'popupTitle_' + insData.key + eleData.key" class="popupLabel" :class="eleData.isDisabled && !eleData.value?'disabled':''">{{eleData.labelName}}</label>
    <label class="checkboxRadioLabel floatRight">
      <input
        :id="'popupTitle_' + insData.key + eleData.key"
        :class="eleData.isDisabled && !eleData.value?'disabled':''"
        type="checkbox"
        v-model="eleData.value"
        :disabled="eleData.isDisabled ? 'disabled' : null"
        @change="onchange"
      >
      <i class="iconfont" :style="eleData.isDisabled && eleData.value ? 'color: #D2DFFE;' : ''" :class="[isDisabled && !eleData.value?'disabled':'', eleData.value?'icon-choose_done_surface':'icon-choose_none_line']"></i>
    </label>

    <cm-validation :validation="$validation"></cm-validation>
    <p v-if="insData.huomian === 'touHuomian' && touHuomianTips" class="disabled_tips">{{touHuomianTips}}</p>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmValidation from './common_plato_validation.vue'

    export default {
      name: 'cmCommonTitle',
      data () {
        var ruleName = this.eleData.ruleName || ('rule' + this.insData.key + this.eleData.key.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase() }))
        var validate = Object.assign(helperJs.initValidateRules(this), (window.verifyRules && verifyRules.validator && verifyRules.validator[ruleName]) || {})
        return {
          validate,
          ruleName
        }
      },
      props: ['allInputData', 'eleData', 'insData', 'productData'],
      validator: {
        // auto: true          // 初始化后自动检查
      },
      methods: {
        onchange () {
          this.$emit("changeEleData", this)
        }
      },
      computed: {
        value () {
          return this.eleData.value
        },
        isMainIns () {
          var index = this.productData.mulInsOrderList[0].key === 'common' ? 1 : 0
          return this.$root.allInitData.popupData.relatedProduct[0] === 'allMainInsData' && (this.productData.mulInsOrderList[index].key === this.insData.key)
        },
        isDisabled () {
          return this.eleData.isDisabled
        },
        /**
         * @Author   Lizh
         * @DateTime 2019-07-11
         * @return   {[type]}   [description]
         */
        touHuomianTips () {
            let personOrderList = this.allInputData.inputData.personData.personOrderList
            let applicationInfo = helperJs.getArraySubEle(personOrderList, "key", "applicantInfo")
            let applicationTitle = applicationInfo && helperJs.getArraySubEle(applicationInfo.eleOrderList, 'key', 'title')
            let applicationSame = applicationInfo && helperJs.getArraySubEle(applicationInfo.eleOrderList, 'key', 'applicantAndInsuredSame')
            if (applicationInfo && applicationTitle.value) {//是否勾选投保人
                if (applicationSame && applicationSame.value) {//投被保人是否为同一人
                    if (this.insData.allowSamePerson) {//险种是否允许投被保人为同一人
                        if (this.eleData.isDisabled) {
                            return '当前方案下不能选择投保人豁免'
                        } else {
                            return '投保人、被保人为同一人'
                        }
                    } else {
                        return '投被保人为同一人时，该险种不可选'
                    }
                } else {
                    if (this.eleData.isDisabled) {
                        return '当前方案下不能选择投保人豁免'
                    } else {
                        return '投保人、被保人非同一人'
                    }
                }
            } else {
                if (this.insData.allowSamePerson) {//险种是否允许投被保人为同一人
                    if (this.eleData.isDisabled) {
                        return '当前方案下不能选择投保人豁免'
                    } else {
                        return '投保人、被保人为同一人'
                    }
                } else {
                    return '如需选择，请返回上一页勾选并填写投保人信息'
                }
            }
        }
      },
      components: {
        cmValidation
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .popupTitleDiv {
    & .codeSpanBtn {
      margin-right: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      color: #FF703E;
      border: 1px solid #FF703E;
      vertical-align: middle;
    }
    & i.icon-main {
      line-height: normal;
      position: absolute;
      top: 50%;
      margin-top: -26px;
      font-size: 44px;
      color: #FF703E;
    }
    & .popupLabel {
      width: 64%;
      font-weight: 500;
      color: #333;
    }
    & .checkboxRadioLabel {
      line-height: 92px;
    }
    & .disabled_tips {
      padding-bottom: 24px;
    }
  }
</style>
