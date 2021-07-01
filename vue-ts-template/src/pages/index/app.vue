<template>
  <div class="class_name">
    vue-ts-template {{height}}
    <bxs-default-page></bxs-default-page>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import safeAreaInsets from '@/utils/safe_area_insets'
// import safeAreaInsets from 'safe-area-insets'
import { DefaultPage } from 'bxs-ui-vue'

import {} from '@/api/index'
import {
  initPageBasicConfig
} from '@/utils'

Vue.use(DefaultPage)

export default Vue.extend({
  name: 'app',
  components: {},
  data () : any {
    return {
      height: 0
    }
  },
  computed: {
    ...mapGetters({
      USER_INFO: 'USER_INFO'
    })
  },
  watch: {},
  created () : any {
    this.height = safeAreaInsets.bottom + 1
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
