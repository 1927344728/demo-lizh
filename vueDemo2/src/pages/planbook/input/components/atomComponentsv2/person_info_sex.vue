<template>
  <div class="clearFloat">
    <label class="pInfoLabel">{{elementUiInfo && elementUiInfo.labelName || '性别'}}</label>
    <div class="inputRadioDiv">
      <span class="inputWithTextSpan" v-for="n in sexOpts" :data-stat-id="personData.key + '_sex'">
        <input
          :id="'sex_' + personData.key + n.val"
          type="radio"
          v-model.number="elementUiInfo.value"
          :value="n.val"
          :disabled="personData.key === 'spouseInfo' || elementUiInfo.isDisabled ? true: null"
          @change="onchange"
          >
        <label :for="'sex_' + personData.key + n.val" :class="{
          'active': elementUiInfo.value == n.val, disabled: personData.key === 'spouseInfo',
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

      computed: {
        sexOpts () {
          var sexOpts = [
            { val: '1', desc: '男' },
            { val: '2', desc: '女' }
          ]
          return (this.elementUiInfo && this.elementUiInfo.opts && this.elementUiInfo.opts.length) ? this.elementUiInfo.opts : sexOpts
        }
      }
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
