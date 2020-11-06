<template>
  <div class="posRelative clearFloat">
    <!-- 通用的表单 input元素 radio[label]放在input框内 -->
    <label class="popupLabel" v-if="eleData.labelName">{{eleData.labelName}}</label>
    <div class="popupRadioDiv floatRight">
      <span class="inputWithTextSpan" v-for="(opt, idx) in opts" v-if="!opt.isHide">
        <input
          :id="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val"
          class="popupRadio"
          type="radio"
          v-model="eleData.value"
          :value="opt.val"
          :disabled="opt.isDisabled?true:null"
          v-if="!opt.isHide"
          @change="onchange"
        >
        <label :for="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val" :class="{active: eleData.value==opt.val}">
          <span>{{opt.desc}}</span>
        </label>
      </span>
    </div>

    <cm-validation :validation="$validation"></cm-validation>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmValidation from './common_plato_validation.vue'

    export default {
      name: 'cmCommonRadioBtn',
      data () {
        var ruleName = this.eleData.ruleName || ('rule' + this.insData.key + this.eleData.key.replace(/\b(\w)|\s(\w)/g, function (m) { return m.toUpperCase() }))
        var validate = Object.assign(helperJs.initValidateRules(this), (window.verifyRules && verifyRules.validator && verifyRules.validator[ruleName]) || {})
        return {
          validate,
          ruleName
        }
      },
      props: ['eleData', 'insData', 'productData'],
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
        opts () {
          var self = this
          var opts = self.eleData.opts
          if ( opts.filter(function (opt) { return opt.val == self.eleData.value })[0].isDisabled ) {
            opts.map(function (opt) {
              if (!opt.isDisabled) {
                self.eleData.value = opt.val
              }
            })
          }
          return opts
        }
      },
      components: {
        cmValidation
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .popupRadioDiv {
    display: inline-block;
    max-width: 75%;
    padding: 4px 0 20px;
    vertical-align: middle;
    text-align: right;
    & .inputWithTextSpan {
      & input {
        opacity: 1;
      }
    }
  }
</style>
