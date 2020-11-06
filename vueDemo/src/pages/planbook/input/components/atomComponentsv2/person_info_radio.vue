<template>
  <div class="clearFloat">
    <label class="pInfoLabel">{{elementUiInfo && elementUiInfo.labelName || ''}}</label>
    <div class="inputRadioDiv">
      <span class="inputWithTextSpan" v-for="n in elementUiInfo.opts" :data-stat-id="`${personData.key}_${elementUiInfo.key}`">
        <input
          :id="`${elementUiInfo.key}_${personData.key}_${n.val}`"
          type="radio"
          v-model.number="elementUiInfo.value"
          :value="n.val"
          :disabled="elementUiInfo.isDisabled ? true: null"
          @change="onchange"
          >
        <label :for="`${elementUiInfo.key}_${personData.key}_${n.val}`" :class="{
          'active': elementUiInfo.value == n.val,
          'disabled': elementUiInfo.isDisabled
        }">
          <span>{{n.desc}}</span>
        </label>
      </span>
    </div>
  </div>
</template>

<script>
    export default {
      name: 'cmInfoSex',
      data () {
        return {
        }
      },
      props: ['personData', 'elementUiInfo'],
      methods: {
        onchange (e) {
          this.elementUiInfo.value = e.target.value * 1
          this.$emit('relatePersonInfo')
        }
      },
      watch: {
        // "elementUiInfo.value" () {
        //     this.$emit('relatePersonInfo')
        // }
      },
    }
</script>

<style scoped>
    @import 'variables.css';
    .inputRadioDiv{
      display: inline-block;
      line-height: normal;
      padding: 0 0 16px;
      text-align: right;
      float: right;
      & .inputWithTextSpan {
        & input {
          opacity: 1;
        }
        & label {
          padding: 0 46px;
        }
      }
    }

</style>
