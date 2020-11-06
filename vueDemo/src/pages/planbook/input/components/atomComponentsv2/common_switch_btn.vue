<template>
  <div class="switchBtnDiv">
    <input type="checkbox" class="inputSwitchBtn" :class="{disabled: isDisabled}" v-model="eleData.title" :disabled="isDisabled?'disabled':null" @change="cgSwitchFn">
  </div>
</template>

<script>
    export default {
      name: 'cmSwitchBtn',
      props: ['eleData', 'eleUi', 'personType'],
      methods: {
        cgSwitchFn () {
          this.$emit('cgSwitchFn', this.personType)
        }
      },
      computed: {
        isDisabled () {
          return this.eleUi.title && this.eleUi.title.isDisabled
        }
      }
    }
</script>

<style scoped>
  @import 'variables.css';
  .switchBtnDiv {
    display: inline-block;
  }
  input[type="checkbox"].inputSwitchBtn {
      position: static;
      appearance: none;
      -webkit-appearance: none;
      position: relative;
      width: 72px;
      height: 44px;
      background: #ddd;
      border-radius: 32px;
      border: 1px solid #ddd;
      outline: 0;
      box-sizing: border-box;
  }
  input[type="checkbox"].inputSwitchBtn:checked {
      border-color: #508CEE;
      background-color: #508CEE;
  }
  input[type="checkbox"].inputSwitchBtn:before, input[type="checkbox"].inputSwitchBtn:after {
      content: " ";
      position: absolute;
      top: 0;
      left: 0;
      height: 40px;
      border-radius: 30px;
      transition: transform 0.3s, -webkit-transform 0.3s;
      -webkit-transition: -webkit-transform 0.3s;
  }
  input[type="checkbox"].inputSwitchBtn:before {
      width: 68px;
      background-color: #fff;
  }
  input[type="checkbox"].inputSwitchBtn:after {
      width: 40px;
      background-color: white;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.4);
  }
  input[type="checkbox"].inputSwitchBtn:checked:before {
      content: "";
      transform: scale(0);
      -webkit-transform: scale(0);
  }
  input[type="checkbox"].inputSwitchBtn:checked:after {
      content: "";
      transform: translateX(14px);
      -webkit-transform: translateX(14px);
  }
  input[type="checkbox"].inputSwitchBtn.disabled:before, input[type="checkbox"].inputSwitchBtn.disabled:after {
    background: #F0EFF4;
  }
</style>
