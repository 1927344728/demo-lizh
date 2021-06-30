<template>
  <div class="posRelative clearFloat">
    <label class="pInfoLabel">{{elementUiInfo && elementUiInfo.labelName || '姓名'}}</label>
    <div class="inputDiv floatRight">
      <input
        class="pInfoInput"
        type="text"
        v-model.trim="elementUiInfo.value"
        :class="[
          elementUiInfo.isDisabled ? 'disabled' : '',
          elementUiInfo.key === 'shareTitle' ? 'shareTitle' : ''
        ]"
        :readonly="elementUiInfo.isDisabled ? true : null"
        :style="{
          pointerEvents: elementUiInfo.isDisabled ? 'none' : 'initial',
        }"
        :maxlength="elementUiInfo.maxlength || 10"
        :placeholder="elementUiInfo && elementUiInfo.placeholder || '请输入姓名'"
        @click="ckInputFn"
        @change="onchange"
        >
      <cm-icon-clear v-if="elementUiInfo.value && !elementUiInfo.isDisabled" @clearData="clearInputData"></cm-icon-clear>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'cmInfoName',
    data () {
      return {
      }
    },
    props: ['personData', 'elementUiInfo'],
    methods: {
      onchange () {
          // this.$emit('relatePersonInfo')
      },
      ckInputFn () {
        console.log('ckInputFn')
      },
      clearInputData () {
        this.elementUiInfo.value = ''
      }
    }
  }
</script>

<style scoped>
    @import 'variables.css';
    .inputDiv {
      text-align: right;
      & input {
        width: 252px;
        &.shareTitle {
          width: 416px;
        }
      }
    }
</style>
