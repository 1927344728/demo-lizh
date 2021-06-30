<template>
  <div class="posRelative clearFloat">
    <label class="pInfoLabel">{{elementUiInfo.labelName || '年龄'}}</label>
    <div class="inlineBlock floatRight">
      <div class="birthdayBtnDiv" @click="openPicker" :data-stat-id="personData.key + '_birthday'">
          <em :style="{color: elementBirthday && elementBirthday.value && !elementBirthday.isDisabled? '#666':'#ccc'}">{{elementBirthday && elementBirthday.value || (personData.birthday) || '生日(选填)'}}</em>
          <i class="iconfont icon-arrow_down"></i>
      </div>
      <select class="ageSelect" v-model.number="elementUiInfo.value" :class="elementUiInfo.isDisabled ? 'disabled' : ''" @change="onchange" :disabled="elementUiInfo.isDisabled ? true : null"  :data-stat-id="personData.key + '_age'">
        <option v-for="n in options" :value="n">{{n}}岁</option>
      </select>
      <i class="iconfont icon-arrow_down"></i>
    </div>

    <mt-datetime-picker
        ref            = "picker"
        v-model        = "value"
        :type          = "pickerConfig.type"

        :year-format   = "pickerConfig.yearFormat"
        :month-format  = "pickerConfig.monthFormat"
        :date-format   = "pickerConfig.dateFormat"
        :start-date    = "startDate"
        :end-date      = "endDate"

        :confirm-text  = "pickerConfig.confirmText"
        :cancel-text   = "pickerConfig.cancelText"

        @confirm       = "handleConfirm"
    ></mt-datetime-picker>
  </div>
</template>

<script>
    import Vue from 'vue'
    import helperJs from '@/utils/helper'
    import {
        pBType
    } from '@/utils/index'
    import { DatetimePicker } from 'mint-ui'
    import 'mint-ui/lib/style.css'
    Vue.component(DatetimePicker.name, DatetimePicker)
    export default {
      name: 'cmInfoAge',
      data () {
        return {
            pickerConfig: {
                ref: 'picker',
                type: 'date',
                confirmText: '确定',
                cancelText: '取消',

                yearFormat: '{value}年',
                monthFormat: '{value}月',
                dateFormat: '{value}日',
                // startDate: ',
                // endDate: ',

                // hourFormat: '{value}',
                // minuteFormat: '{value}',
                // startHour: 10,
                // endHour: 20
            },
            elementBirthday: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'birthday' })[0],
            elementSex: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'sex' })[0]
        }
      },
      props: ['allInputData', 'personData', 'elementUiInfo'],
      methods: {
        openPicker (e) {
            if (!this.elementUiInfo.isDisabled) {
                this.$refs.picker.open()
                var pickerWrap = this.$refs.picker.$el
                pickerWrap && (pickerWrap.ontouchmove = function() {
                    return false
                });
            }
        },
        onchange (e) {
          this.elementUiInfo.value = e.target.value * 1
          if (this.elementBirthday) {
            this.elementBirthday.isDisabled || (this.elementBirthday.value = '')
          } else {
            this.personData.birthday = ''
          }
          this.$emit('relatePersonInfo')
        },
        handleConfirm (value) {
            if (this.elementBirthday) {
              this.elementBirthday.value = helperJs.getDateString(value.getTime()).replace(/-/g, '/')
              this.elementUiInfo.value = helperJs.getAgeFromBirth(this.elementBirthday.value)
            } else {
              this.personData.birthday = helperJs.getDateString(value.getTime()).replace(/-/g, '/')
              this.elementUiInfo.value = helperJs.getAgeFromBirth(this.personData.birthday)
            }
            this.$emit('relatePersonInfo')
        }
      },
      computed: {
        options () {
            // var personUiSex = this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'sex' })[0]
            // var opts = (personUiSex.value * 1 === 2 && this.elementUiInfo && this.elementUiInfo.optsF) ? this.elementUiInfo.optsF : this.elementUiInfo.opts
            // if ((!pBType || !pBType.match(/insPolicy1/)) && (this.elementUiInfo.value < opts[0] || this.elementUiInfo.value > opts[1])) {
            //     this.elementUiInfo.value = opts[0]
            // }
            // var options = []
            // for (let i = opts[0]; i <= opts[1]; i++) {
            //     options[options.length] = i
            // }
            // return options

            var options = []
            if (this.elementUiInfo.optArray && !pBType) {
                this.elementUiInfo.optArray.map(opt => {
                    options.push(opt)
                })
                if (options.indexOf(this.elementUiInfo.value) === -1) {
                    this.elementUiInfo.value = options[0]
                }
            } else {
                var personUiSex = this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'sex' })[0]
                var opts = (personUiSex.value * 1 === 2 && this.elementUiInfo && this.elementUiInfo.optsF) ? this.elementUiInfo.optsF : this.elementUiInfo.opts
                if ((!pBType || !pBType.match(/insPolicy1/)) && (this.elementUiInfo.value < opts[0] || this.elementUiInfo.value > opts[1])) {
                    this.elementUiInfo.value = opts[0]
                }
                for (let i = opts[0]; i <= opts[1]; i++) {
                    options[options.length] = i
                }
            }
            return options
        },

        startDate () {
            var opts = (this.elementSex.value * 1 === 2 && this.elementUiInfo.optsF) ? this.elementUiInfo.optsF : this.elementUiInfo.opts
            return new Date((new Date().getFullYear() - opts[1] - 1), new Date().getMonth(), new Date().getDate() + 1)
        },
        endDate () {
            var opts = (this.elementSex.value * 1 === 2 && this.elementUiInfo.optsF) ? this.elementUiInfo.optsF : this.elementUiInfo.opts
            return new Date((new Date().getFullYear() - opts[0]) + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate())
        },
        value: {
              get () {
                  var now = new Date()
                  return (now.getFullYear() - this.elementUiInfo.value) + '/' + (now.getMonth() + 1) + '/' + now.getDate()
              },
              set () {}
        }
      }
    }
</script>

<style scoped>
    @import 'variables.css';
    .birthdayBtnDiv {
      position: relative;
      display: inline-block;
      width: 216px;
      height: 54px;
      line-height: 54px;
      margin-right: 8px;
      padding-left: 18px;
      vertical-align: middle;
      text-align: left;
      border: 1px solid var(--gray_e5);
      border-radius: 4px;
      overflow: hidden;
      font-size: 28px;
      & em {
          margin-right: 6px;
          color: var(--gray_666);
      }
  }
  .ageSelect {
    min-width: 194px;
  }
  .icon-arrow_down {
    position: absolute;
    top: 50%;
    right: 18px;
    transform: translateY(-50%) scale(0.75);
    font-size: 24px;
  }
</style>
