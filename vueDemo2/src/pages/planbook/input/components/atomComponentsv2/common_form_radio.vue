<template>
  <div class="posRelative radioDiv clearFloat">
    <!-- 通用的表单 input元素 radio 每个选项单独一行 -->
    <div class="radioContentDiv">
      <div class="radioEleDiv" v-for="(opt, idx) in opts" v-if="!opt.isHide" :ins-code="opt.val">
        <label :class="opt.isDisabled?'disabled':''"
               :for="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val" class="radioForLabel">{{opt.desc}}</label>
        <label class="checkboxRadioLabel floatRight">
          <input
            :id="(eleData.name || eleData.key) +'_'+(productData.key || '')+'_'+ opt.val"
            type="radio"
            v-model="eleData.value"
            :value="opt.val"
            :disabled="opt.isDisabled?true:null"
            v-if="!opt.isHide"
            @change="onchange"
          >
          <i class="iconfont" :class="[opt.isDisabled?'disabled':'', eleData.value == opt.val?'icon-multiple_choice':'icon-choose_none_line']"></i>
        </label>
      </div>
    </div>

    <cm-validation :validation="$validation"></cm-validation>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmValidation from './common_plato_validation.vue'

    export default {
      name: 'cmCommonRadio',
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
      created () {
        this.ckInputEle()
      },
      methods: {
        ckInputEle () {
          if (this.insData.isGroup) {
            let eleOrderList = this.insData.eleOrderList.filter(function (ele) {
              return ele.key == 'title' || ele.key == 'insuranceId'
            })
            let eleInsuranceId = this.insData.eleOrderList.filter(function (ele) {
              return ele.key == 'insuranceId'
            })
            eleInsuranceId && (eleInsuranceId = eleInsuranceId[0])

            let curRadioIns  //当前radio选项中，选中的项
            if (eleInsuranceId.value) {
              curRadioIns = helperJs.filterArr(this.productData.mulInsOrderList, eleInsuranceId.value)
            }
            if (curRadioIns) {
              curRadioIns.account !== undefined && (this.insData.account = curRadioIns.account) //切换选项目，更新相对应的追加领取数据
              curRadioIns.accountData !== undefined && (this.insData.accountData = curRadioIns.accountData) //切换选项目，更新相对应的追加领取数据
              this.insData.eleOrderList = eleOrderList.concat(curRadioIns.eleOrderList.filter(function (ele) {
                  return ele.key != 'title'
                } ))
            }
          }
        },
        onchange () {
          this.ckInputEle()
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
          if (self.eleData.value && opts.filter(function (opt) { return opt.val == self.eleData.value })[0].isDisabled ) {
              opts.map(function (opt) {
                if (!opt.isDisabled) {
                  self.eleData.value = opt.val
                }
              })
          }
          return opts
        },
        isDisabled () {
          return this.eleData.isDisabled
        }
      },
      components: {
        cmValidation
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .radioDiv {
    & .radioContentDiv {
      vertical-align: middle;
      & .radioEleDiv {
        display:block;
        position: relative;
        padding: 20px 0;
        vertical-align: middle;
      }
      & .radioForLabel {
        display: inline-block;
        width: 90%;
        vertical-align: middle;
        margin-right: 24px;
      }
    }
  }

</style>
