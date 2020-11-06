<template>
  <div class="inputEleDiv posRelative clearFloat">
    <!-- 通用的表单 input元素 -->
    <label class="popupLabel" v-if="eleData.labelName">{{eleData.labelName}}</label>
    <div class="floatRight">
      <input
        type="text"
        :class="eleData.isDisabled?'disabled':''"
        v-model.number="eleData.value"
        :placeholder="eleData.placeholder || (eleData.key=='baoe'?'请输入保额':(eleData.key=='baof'?'请输入保费':'请输入值'))"
        :maxlength="eleData.maxlength || 9"
        :readonly="eleData.isDisabled?true:null"
        @focus="showUnitValue = true; getUnitValue()"
        @blur="showUnitValue = false"
        @input="getUnitValue()"
        @change="onchange"
        v-if="eleData.inputType=='text'"
        >
      <input
        type="tel"
        :class="eleData.isDisabled?'disabled':''"
        v-model.number="eleData.value"
        :placeholder="eleData.placeholder || (eleData.key=='baoe'?'请输入保额':(eleData.key=='baof'?'请输入保费':'请输入值'))"
        :maxlength="eleData.maxlength || 9"
        :readonly="eleData.isDisabled?true:null"
        @focus="showUnitValue = true; getUnitValue()"
        @blur="showUnitValue = false"
        @input="getUnitValue()"
        @change="onchange"
        v-else
        >

      <div class="unit_tips" v-if="unitValue && showUnitValue">
        <span class="unit_tips_tx">{{unitValue}}</span>
        <em></em>
      </div>
      <cm-icon-clear v-if="eleData.value && !eleData.isDisabled" @clearData="clearInputData"></cm-icon-clear>
    </div>

    <cm-validation :validation="$validation"></cm-validation>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper.js'
    import cmIconClear from './common_icon_clear.vue'
    import cmValidation from './common_plato_validation.vue'

    export default {
      mixins: [helperJs.myMixin],
      name: 'cmCommonInput',
      data () {
        var ruleName = this.eleData.ruleName || ('rule' + this.insData.key + this.eleData.key.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase() }))
        var validate = Object.assign(helperJs.initValidateRules(this), (window.verifyRules && verifyRules.validator && verifyRules.validator[ruleName]) || {})
        if (this.eleData.multi && !this.eleData.placeholder) {
          this.eleData.placeholder = this.eleData.multi + '的整数倍'
        }
        return {
          validate,
          ruleName,
          unitValue: '',
          showUnitValue: false
        }
      },
      props: ['eleData', 'insData', 'productData'],
      validator: {
        // auto: true          // 初始化后自动检查
      },
      methods: {
        onchange () {
          this.$emit("changeEleData", this)
        },
        onFocus () {
          this.$el.getElementsByTagName('input')[0].scrollIntoView()
        },
        clearInputData () {
          this.eleData.value = ''
          this.onchange()
        },
        getUnitValue () {
          let digits = isNaN(this.eleData.value * 1) ? 0 : Math.floor(Math.log10(this.eleData.value) + 1)
          switch (digits) {
            case 5:
              this.unitValue = '万'
              break;
            case 6:
              this.unitValue = '十万'
              break;
            case 7:
              this.unitValue = '百万'
              break;
            case 8:
              this.unitValue = '千万'
              break;
            case 9:
              this.unitValue = '亿'
              break;
            default:
              this.unitValue = ''
          }
        }
      },
      computed: {
        value () {
          return this.eleData.value
        },
      },
      components: {
        cmIconClear,
        cmValidation
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .inputEleDiv {
    & .floatRight {
      font-size: 0;
      line-height: 92px;
    }
    & .unit_tips {
      display: inline-block;
      position: absolute;
      top: 50%;
      left: 16px;
      margin-top: 22px;
      line-height: normal;
      & .unit_tips_tx {
        position: relative;
        display: inline-block;
        padding: 2px 24px;
        line-height: normal;
        background: var(--gray_666);
        color: #fff;
        font-size: 24px;
        border-radius: 8px;
        z-index: 2;
      }
      & em {
        display: inline-block;
        position: absolute;
        top: -5px;
        left: 50%;
        width: 10px;
        height: 10px;
        background: var(--gray_666);
        transform: translateX(-50%) rotate(45deg);
        content: ' ';
        z-index: 1;
      }
    }
  }
</style>
