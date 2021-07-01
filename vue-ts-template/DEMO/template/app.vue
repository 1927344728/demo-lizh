<template>
  <div class="class_name">
    vue-ts-template
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
// import {} from 'bxs-ui-vue'

// import {} from '@/api/index'
import {
  initPageBasicConfig
} from '@/utils'

export default Vue.extend({
  name: 'app',
  components: {},
  data () : any {
    return {
    }
  },
  computed: {
    ...mapGetters({
      USER_INFO: 'USER_INFO'
    })
  },
  watch: {},
  created () : any {
    initPageBasicConfig({
      statSDKPageId: 'PAGE_ID',
      documentTitle: '页面标题',
      pageWrapperDom: document.body
    })
    this.$store.dispatch('setUserInfo')
  },
  methods: {}
})
</script>
<style>
@import './index.css';
</style>
