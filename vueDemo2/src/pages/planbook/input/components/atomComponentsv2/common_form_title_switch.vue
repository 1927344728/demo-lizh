<template>
  <div class="posRelative">
    <!-- 被保人、投保人、投保人豁免 标题 -->
    <label :for="'popupTitle_'+(productData.key || '')" class="popupTitleLabel" :class="eleData.isDisabled?'disabled':''">{{eleData.labelName}}</label>
    <cm-switch-btn class="switchBtnPos" v-if="eleData.isSwitch" :ele-ui="eleData" @cgSwitchFn="cgSwitchFn"></cm-switch-btn>
  </div>
</template>

<script>
    import helperJs from '@/utils/helper'
    import cmSwitchBtn from './common_switch_btn.vue'

    export default {
      name: 'cmCommonTitleSwitch',
      props: ['eleData', 'insData', 'productData'],
      methods: {
        cgSwitchFn (type) {
          this.$emit('cgSwitchFn', type)
        }
      },
      components: {
        cmSwitchBtn
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .popupTitle {
    margin-left: -48px;
    & i {
      margin-right: 4px;
      vertical-align: middle;
      color: var(--mainColor_blue);
    }
  }
  .popupTitleLabel {
    display: inline-block;
    max-width: 90%;
    padding: 30px 0;
    vertical-align: middle;
  }
  .switchBtnPos {
    position: absolute;
    top: 50%;
    right: 0;
    line-height: normal;
    margin-top: -22px;
  }
</style>
