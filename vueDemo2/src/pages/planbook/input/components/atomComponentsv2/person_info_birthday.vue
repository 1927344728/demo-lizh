<template>
    <div class="posRelative clearFloat">
    <label class="pInfoLabel">{{elementUiInfo.labelName || '生日'}}</label>
    <div class="inlineBlock floatRight">
        <div class="birthdayBtnDiv" @click="openPicker">
            <em :style="{color: elementUiInfo.value && !elementUiInfo.isDisabled? '#666':'#ccc'}">{{elementUiInfo.value || '生日(选填)'}}</em><i class="iconfont icon-calendar"></i>
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
    name: 'cmInfoBirthday',
    data () {
        let insuranceData = helperJs.filterArr(this.allInputData.inputData.personData.personOrderList, 'insuredInfo')
        let applicantData = helperJs.filterArr(this.allInputData.inputData.personData.personOrderList, 'applicantInfo')
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
            elementUiInfo: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'birthday' })[0],
            elementInsuranceDay: insuranceData.eleOrderList && insuranceData.eleOrderList.filter(function(ele){ return ele.key == 'insuranceDay' })[0],
            elementMemberId: applicantData && applicantData.eleOrderList && applicantData.eleOrderList.filter(function(ele){ return ele.key == 'activeMemberId' })[0],
            elementAge: this.personData.eleOrderList.filter(function(ele){ return ele.key == 'age' })[0],
            elementSex: this.personData.eleOrderList.filter(function(ele){ return ele.key == 'sex' })[0]
        }
    },
    props: ['allInputData', 'personData'],
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
        handleConfirm (value) {
            let self = this

            self.elementUiInfo.value = helperJs.getDateString(value.getTime()).replace(/-/g, '/')
            self.elementAge.value = helperJs.getAgeFromBirth(self.elementUiInfo.value, self.elementInsuranceDay.value)

            if (self.personData.key === 'applicantInfo' && !self.elementMemberId.value && new Date(self.elementUiInfo.value).getTime() < self.startDate || new Date(self.
              elementUiInfo.value).getTime() > self.endDate) {
              self.elementUiInfo.value = helperJs.getDateString(self.endDate)
            }

            self.$emit('relatePersonInfo')
        }
    },
    // watch: {
    //     elementUiInfo: {
    //       deep: true,
    //       handler (val, oldVal) {
    //         let self = this
    //         if (self.personData.key === 'applicantInfo' && !self.elementMemberId.value && new Date(self.elementUiInfo.value).getTime() < self.startDate || new Date(self.
    //           elementUiInfo.value).getTime() > self.endDate) {
    //           self.elementUiInfo.value = helperJs.getDateString(self.endDate)
    //         }
    //       }
    //     }
    // },
    computed: {
        startDate () {
          var opts = (this.elementSex.value * 1 === 2 && this.elementAge.optsF) ? this.elementAge.optsF : this.elementAge.opts
          var insuranceDate = new Date(this.elementInsuranceDay.value)
          return new Date((insuranceDate.getFullYear() - opts[1] - 1), insuranceDate.getMonth(), insuranceDate.getDate() + 1)
        },
        endDate () {
          var opts = (this.elementSex.value * 1 === 2 && this.elementAge.optsF) ? this.elementAge.optsF : this.elementAge.opts
          var insuranceDate = new Date(this.elementInsuranceDay.value)
          return new Date((insuranceDate.getFullYear() - opts[0]), insuranceDate.getMonth(), insuranceDate.getDate())
        },
        value: {
            get () {
                var now = new Date()
                return this.elementUiInfo.value ? this.elementUiInfo.value : ((now.getFullYear() - this.elementAge.value) + '/' + (now.getMonth() + 1) + '/' + now.getDate())
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
