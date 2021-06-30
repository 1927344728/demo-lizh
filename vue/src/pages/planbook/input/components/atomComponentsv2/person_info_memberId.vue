<template>
  <div class="posRelative clearFloat">
    <label class="pInfoLabel">{{elementUiInfo.labelName || '家庭成员'}}</label>
    <div class="inlineBlock floatRight">
      <select v-model="elementUiInfo.value" @change="onchange">
        <option v-for="n in options" :value="n.cid">{{n.name}}</option>
      </select>
      <em class="upArrowIcon"></em>
    </div>
  </div>
</template>

<script>
import helperJs from '@/utils/helper'
export default {
    name: 'cmInfoMemberId',
    data () {
        let insuredInfo = helperJs.getArraySubEle(this.allInputData.inputData.personData.personOrderList, 'key', 'insuredInfo')
        let insuranceDay = helperJs.getArraySubEle(insuredInfo.eleOrderList, 'key', 'insuranceDay')
        return {
            insuranceDay, //投保日
            elementTitle: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'title' })[0],
            elementBirthday: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'birthday' })[0],
            // elementName: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'name' })[0],
            elementSex: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'sex' })[0],
            elementAge: this.personData.eleOrderList && this.personData.eleOrderList.filter(function(ele){ return ele.key == 'age' })[0],
            helperJs: helperJs
        }
    },
    props: ['allInputData', 'personData', 'elementUiInfo'],
    methods: {
        onchange () {
            let self = this
            self.elementUiInfo.opts.map(function (opt) {
                if (opt.cid == self.elementUiInfo.value) {
                    // self.elementName.value = opt.name
                    self.elementSex.value = opt.sex
                    self.elementAge.value = helperJs.getAgeFromBirth(opt.birthday, self.insuranceDay.value)
                    self.elementBirthday.value = opt.birthday
                    self.elementSex.isDisabled = !!self.elementUiInfo.value
                    self.elementBirthday.isDisabled = !!self.elementUiInfo.value
                }
            })
            this.$emit('relatePersonInfo')
        }
    },
    watch: {
        // "elementUiInfo.value" () {
        //     let self = this
        //     self.elementUiInfo.opts.map(function (opt) {
        //         if (opt.cid == self.elementUiInfo.value) {
        //             // self.elementName.value = opt.name
        //             self.elementSex.value = opt.sex
        //             self.elementAge.value = helperJs.getAgeFromBirth(opt.birthday, self.insuranceDay.value)
        //             self.elementBirthday.value = opt.birthday
        //             self.elementSex.isDisabled = !!self.elementUiInfo.value
        //             self.elementBirthday.isDisabled = !!self.elementUiInfo.value
        //         }
        //     })
        //     this.$emit('relatePersonInfo')
        // }
    },
    computed: {
        options () {
            let self = this
            let ageOpt = self.elementAge.opts
            let opts = self.elementUiInfo.opts.filter(function (opt, i) {
                return opt.cid == '' || (helperJs.getAgeFromBirth(opt.birthday, self.insuranceDay.value) >= ageOpt[0] && helperJs.getAgeFromBirth(opt.birthday, self.insuranceDay.value) <= ageOpt[1])
            })

            let activeMember
            if (opts && opts.length > 1 && opts.every(ele => ele.cid !== this.elementUiInfo.value)) {
                activeMember = opts[1]
            }
            if (opts && opts.length <= 1) {
                activeMember = opts[0]
                self.elementSex.isDisabled = false
                self.elementBirthday.isDisabled = false
            }
            if (activeMember) {
                self.elementUiInfo.value = activeMember.cid
                self.elementSex.value = activeMember.sex
                self.elementAge.value = helperJs.getAgeFromBirth(activeMember.birthday, self.insuranceDay.value);
                self.elementBirthday && (self.elementBirthday.value = activeMember.birthday)
            }
          return opts
        }
    }
}
</script>

<style scoped>
  @import 'variables.css';
</style>
