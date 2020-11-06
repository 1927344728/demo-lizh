<template>
  <div class="personInfoDiv">
    <!-- 被保人、投保人、投保人配偶信息  -->
    <template
      v-if="personOrderList"
      v-for="(person, idx) in personOrderList"
    >
      <component
        :is="person.componentName || 'insureInfo'"
        :person-data="person"
        @cgInfoFn="cgInfoFn"
        >
      </component>
    </template>
  </div>
</template>

<script>
  import insureInfo from './insure_info.vue'

  export default {
    name: 'cmPersonInfo',
    data () {
      return {
      }
    },
    props: ['planbookData'],
    methods: {
      cgInfoFn (type) {
        this.$emit('cgInfoFn', type)
      }
    },
    computed: {
      personOrderList () {
        var personOrderList = this.planbookData && this.planbookData.personData && this.planbookData.personData.personOrderList

        var applicantInfoAge
        var spouseInfoAge
        personOrderList && personOrderList.length && personOrderList.map(function(ele){
          if (ele.key == 'applicantInfo') {
            applicantInfoAge = ele.eleOrderList.filter(function(e){
              return e.key == 'age'
            })[0]
          } else if (ele.key == 'spouseInfo') {
            spouseInfoAge = ele.eleOrderList.filter(function(e){
              return e.key == 'age'
            })[0]
          }
        })

        if (spouseInfoAge && spouseInfoAge.opts === undefined) {
          spouseInfoAge.opts  = applicantInfoAge.opts
          spouseInfoAge.optsF = applicantInfoAge.optsF
        }
        return personOrderList
      }
    },
    components: {
      insureInfo
    }
  }
</script>

<style scoped>
  @import 'variables.css';

  .personInfoDiv {
    background: #fff;
    padding-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
  }
</style>

