<template>
  <div class="inputEleDiv posRelative clearFloat">
    <!-- 通用的表单 input元素 -->
    <label class="popupLabel" style="max-width: 50%;" v-if="eleData.labelName" :for="'account' + eleData.key">
      <span class="codeSpanBtn" v-if="moduleData.code">{{insData.code}}</span>
      {{eleData.labelName}}
    </label>
    <div class="floatRight">
      <input
        type="text"
        :id="'account' + eleData.key"
        :class="eleData.isDisabled?'disabled':''"
        v-model.number="moduleData[eleData.key]"
        :placeholder="eleData.placeholder || '请输入值'"
        :maxlength="eleData.maxlength || 9"
        :readonly="eleData.isDisabled?true:null"
        @change="onchange"
        @focus="showClearIcon = true"
        @blur="showClearIcon = false"
        v-if="eleData.inputType=='text'"
        >
      <input
        type="tel"
        :id="'account' + eleData.key"
        :class="eleData.isDisabled?'disabled':''"
        v-model.number="moduleData[eleData.key]"
        :placeholder="eleData.placeholder || '请输入值'"
        :maxlength="eleData.maxlength || 9"
        :readonly="eleData.isDisabled?true:null"
        @change="onchange"
        @focus="showClearIcon = true"
        @blur="showClearIcon = false"
        v-else
        >

      <cm-icon-clear :style="{
          opacity: showClearIcon && moduleData[eleData.key] && !eleData.isDisabled ? 1 : 0
        }" @clearData="clearInputData"></cm-icon-clear>
    </div>

    <cm-validation :validation="$validation"></cm-validation>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmIconClear from './common_icon_clear.vue'
    import cmValidation from './common_plato_validation.vue'

    export default {
      mixins: [helperJs.myMixin],
      name: 'cmCommonInputSever',
      data () {
        var validate = helperJs.initValidateRules(this)
        return {
          showClearIcon: false,
          validate
        }
      },
      props: ['eleData', 'moduleData'],
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
          this.moduleData[this.eleData.key] = ''
          this.onchange()
        }
      },
      computed: {
        value () {
          return this.moduleData[this.eleData.key]
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
    & .codeSpanBtn {
      margin-right: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      color: #FF703E;
      border: 1px solid #FF703E;
      vertical-align: middle;
    }
    & .floatRight {
      font-size: 0;
      line-height: 92px;
    }
  }
</style>
