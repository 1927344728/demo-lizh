<template>
    <div class="posRelative clearFloat">
    <label class="pInfoLabel">{{elementUiInfo.labelName || '投保日'}}</label>
    <div class="inlineBlock floatRight">
        <div class="birthdayBtnDiv" @click="openPicker">
            <em :style="{color: elementUiInfo.value? '#666':'#ccc'}">{{elementUiInfo.value || '投保日'}}</em><i class="iconfont icon-calendar"></i>
        </div>
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
import { DatetimePicker } from 'mint-ui'
import 'mint-ui/lib/style.css'
Vue.component(DatetimePicker.name, DatetimePicker)
export default {
    name: 'cmInfoInsuranceDay',
    data () {
        return {
            timer: '',
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
            elementAge: this.personData.eleOrderList.filter(function(ele){ return ele.key == 'age' })[0]
        }
    },
    props: ['allInputData', 'personData', 'elementUiInfo'],
    methods: {
        openPicker (e) {
            this.$refs.picker.open()
            var pickerWrap = this.$refs.picker.$el
            pickerWrap && (pickerWrap.ontouchmove = function() {
                return false
            });
        },
        handleConfirm (value) {
            let self = this
            self.elementUiInfo.value = helperJs.getDateString(value.getTime()).replace(/-/g, '/')

            let applicantInfo = helperJs.getArraySubEle(self.allInputData.inputData.personData.personOrderList, 'key', 'applicantInfo')
            if (applicantInfo) {
                let aAge = helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'age')
                let aBirthday = helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'birthday')
                aAge.value = helperJs.getAgeFromBirth(aBirthday.value, self.elementUiInfo.value)
            }
            self.elementAge.value = helperJs.getAgeFromBirth(self.elementBirthday.value, self.elementUiInfo.value)

            self.$emit('relatePersonInfo')
        }
    },
    watch: {
        // elementUiInfo: {
        //     deep: true,
        //     handler (val, oldVal) {
        //         let self = this
        //         let applicantInfo = helperJs.getArraySubEle(self.allInputData.inputData.personData.personOrderList, 'key', 'applicantInfo')
        //         if (applicantInfo) {
        //             let aAge = helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'age')
        //             let aBirthday = helperJs.getArraySubEle(applicantInfo.eleOrderList, 'key', 'birthday')
        //             aAge.value = helperJs.getAgeFromBirth(aBirthday.value, this.elementUiInfo.value)
        //         }
        //         self.elementAge.value = helperJs.getAgeFromBirth(self.elementBirthday.value, this.elementUiInfo.value)
        //     }
        // }
    },
    computed: {
        startDate () {
            let birthdayStr = this.elementBirthday.value.split('-')
            let minInsTime = new Date(birthdayStr[0] * 1 + this.elementAge.opts[0], birthdayStr[1] - 1, birthdayStr[2] * 1).getTime()
            let today = new Date().getTime()
            if (minInsTime > today) {
                this.$toast('当前年龄不能投保此险种')
                clearTimeout(self.timer)
                self.timer = setTimeout(function () {
                    history.go(-1)
                }, 2000)
            }
            return pBType == 'insPolicy1' ? new Date(minInsTime > today ? today : minInsTime) : new Date()
        },
        endDate () {
            let birthdayStr = this.elementBirthday.value.split('-')
            let maxInsTime = new Date(birthdayStr[0] * 1 + this.elementAge.opts[1] + 1, birthdayStr[1] - 1, birthdayStr[2] * 1 - 1).getTime()
            let today = new Date().getTime()
            return pBType == 'insPolicy1' ? new Date(maxInsTime > today ? today : maxInsTime) : new Date(new Date(today).getFullYear(), new Date(today).getMonth() + 1, new Date(today).getDate())
        },
        value: {
            get () {
                this.elementUiInfo.value = this.elementUiInfo.value || helperJs.getDateString(this.endDate).replace(/-/g, '/')
                return this.elementUiInfo.value
            },
            set () {},
        }
    }
}
</script>

<style scoped>
    @import 'variables.css';
    .birthdayBtnDiv {
        position: relative;
        display: inline-block;
        width: 256px;
        height: 52px;
        line-height: 56px;
        padding-left: 20px;
        vertical-align: middle;
        text-align: left;
        border: 1px solid var(--gray_e5);
        border-radius: 4px;
        overflow: hidden;
        font-size: 28px;
        & i {
          position: absolute;
          right: 12px;
          line-height: 50px;
          font-size: 32px;
          color: var(--gray_666);
      }
      & em {
          margin-right: 6px;
          color: var(--gray_666);
      }
  }
</style>
