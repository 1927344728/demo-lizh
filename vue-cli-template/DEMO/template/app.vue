<template>
  <div class="class_name">
    页面已创建
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

import {
  initBasicConfig
} from '@/utils'
import {
  getCommonCurrentUser
} from '@/api/index.js'

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },
  created() {
    initBasicConfig({
      statSDKPageId: 'PAGE_',
      documentTitle: 'Hello!',
      pageWrapperDom: document.body
    })
    getCommonCurrentUser().then(res => {
      if (res.success) {
        this.$store.dispatch('setUserInfo', res.data)
      }
    })
  },
  mounted() {

  },
  methods: {
  },
}
</script>
<style>
@import './index.css';
</style>