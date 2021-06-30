<template>
  <div class="selectEleDiv posRelative">
    <!-- 通用的表单 select元素 -->
    <label class="popupLabel" v-if="eleData.labelName">{{eleData.labelName}}</label>
    <div class="floatRight">
      <select :class="isDisabled?'disabled':''" v-model.number="moduleData[eleData.key]" :disabled="isDisabled?'disabled':null" @change="changeFn">
        <option v-if="!opts || !opts.length" :key="" :value="undefined">没有可选项</option>
        <option v-for='opt in opts' :key="opt.val" :value="opt.val + ''">{{opt.desc}}</option>
      </select>
      <em class="upArrowIcon" :class="isDisabled?'disabled' : ''"></em>
    </div>

    <cm-validation :validation="$validation"></cm-validation>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmValidation from './common_plato_validation.vue'

    export default {
      name: 'cmCommonSelectSever',
      data () {
        return {
          validate: this.eleData.rules
        }
      },
      props: ['eleData', 'moduleData'],
      validator: {
        // auto: true          // 初始化后自动检查
      },
      methods: {
        changeFn () {
          this.$emit("changeEleData", this)
        }
      },
      computed: {
        value () {
          return this.moduleData[this.eleData.key]
        },
        opts () {
          var me = this
          var opts = []
          if (me.eleData.optConf && me.eleData.optConf[1]) {
            for (var s = me.eleData.optConf[0] * 1; s <= me.eleData.optConf[1] * 1;) {
              opts.push({
                val: me.eleData.optConf[2] && me.eleData.optConf[2].valfix ? s + '' + me.eleData.optConf[2].valfix : s,
                desc: me.eleData.optConf[2] && me.eleData.optConf[2].desc ? me.eleData.optConf[2].desc.replace(/{{&&}}/, s) : s
              })
              s = s + ((me.eleData.optConf[2] && me.eleData.optConf[2].step) || 1);
            }
          } else if(me.eleData.opts && me.eleData.opts.length) {
            opts = me.eleData.opts
          }

          if (opts.every(function (ele) { return ele && ele.val != me.moduleData[me.eleData.key] })) {
            me.moduleData[me.eleData.key] = opts[0] && opts[0].val
          }
          return opts
        },
        isDisabled () {
          var me = this
          return me.eleData.isDisabled || me.opts.length <= 1
        }
      },
      components: {
        cmValidation
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .selectEleDiv {
      line-height: 92px;
      & em.upArrowIcon.disabled {
        border-bottom-color: #ccc;
        border-right-color: #ccc;
      }
  }
</style>
