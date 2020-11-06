<template>
    <div v-if="validation" class="errorTipsDiv clearFloat">
        <span class="errorTips" v-for=" error in validation.errors" v-if="error.message">{{error.message}}</span>
    </div>
</template>

<script>
  /* plato-validation 的错误提示模块 */
  export default {
    name: 'cmValidation',
    props: ['validation']
  }
</script>
<style scoped>
  .errorTipsDiv {
    & .errorTips {
      display: block;
      margin-top: -10px;
      padding-bottom: 16px;
      line-height: 145%;
      border-radius: 48px;
      color: #F04848;
      font-size: 26px;
    }
  }
</style>
