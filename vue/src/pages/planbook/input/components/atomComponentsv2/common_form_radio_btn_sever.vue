<template>
  <div class="posRelative clearFloat">
    <!-- 通用的表单 input元素 radio[label]放在input框内 -->
    <label class="popupLabel" v-if="eleData.labelName">{{eleData.labelName}}</label>
    <div class="popupRadioDiv floatRight">
      <span class="inputWithTextSpan" v-for="(opt, idx) in opts" v-if="!opt.isHide">
        <input
          :id="(eleData.name || eleData.key) +'_fastCompare_'+ opt.val"
          class="popupRadio"
          type="radio"
          v-model="moduleData[eleData.key]"
          :value="opt.val"
          :disabled="opt.isDisabled?true:null"
          v-if="!opt.isHide"
          @change="onchange"
        >
        <label :for="(eleData.name || eleData.key) +'_fastCompare_'+ opt.val" :class="{active: moduleData[eleData.key]==opt.val}">
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
      name: 'cmCommonRadioBtnSever',
      data () {
        var validate = Object.assign(helperJs.initValidateRules(this), (window.verifyRules && verifyRules.validator && verifyRules.validator[ruleName]) || {})
        return {
          validate,
        }
      },
      props: ['eleData', 'moduleData'],
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
          return this.moduleData[this.eleData.key]
        },
        opts () {
          var self = this
          var opts = self.eleData.opts
          if ( opts.filter(function (opt) { return opt.val == self.moduleData[self.eleData.key] })[0].isDisabled ) {
            opts.map(function (opt) {
              if (!opt.isDisabled) {
                self.moduleData[self.eleData.key] = opt.val
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
