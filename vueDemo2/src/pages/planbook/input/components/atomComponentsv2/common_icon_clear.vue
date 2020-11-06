<template>
  <div class="iconClearDiv" @click="clearInputData">
    <i class="iconfont icon-close_circle_surface"></i>
  </div>
</template>

<script>
    export default {
      name: 'cmIconClear',
      methods: {
        clearInputData () {
          this.$emit('clearData')
        }
      }
    }
</script>

<style scoped>
    .iconClearDiv {
      position: absolute;
      top: 50%;
      right: 4px;
      width: 36px;
      height: 32px;
      line-height: 32px;
      display: inline-block;
      margin-top: -16px;
      z-index: 1;
      font-size: 0;
      & i {
        color: #ccc;
        font-size: 32px;
      }
    }
</style>
