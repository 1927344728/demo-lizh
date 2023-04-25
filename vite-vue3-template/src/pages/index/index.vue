<script setup>
import { reactive, onMounted, computed } from 'vue'
import { getCommonCurrentUser } from '@/api/index.js'
import { initBasicConfig } from '@/utils/index.js'

import { useCounterStore } from '@/stores/counter.js'
import HelloWorld from './components/HelloWorld.vue'

console.log(appBridge.isApp())

const reactData = reactive({
  userInfo: null
})
const counter = useCounterStore()
const msg = computed(() => reactData.userInfo ? `Hellow, ${reactData.userInfo.name}` : 'You did it!')

apiGetCommonCurrentUser()

onMounted(() => {
  initBasicConfig({
    documentTitle: 'ViteVueDemo',
    statSDKPageId: 'JHS_CPDB',
    pageWrapperDom: document.body
  })
})

function onClickCounter () {
  counter.increment()
}

function apiGetCommonCurrentUser () {
  return getCommonCurrentUser().then(({ data }) => {
    reactData.userInfo = data
  })
}
</script>

<template>
  <header class="page_index">
    <HelloWorld :msg="msg" />
  </header>

  <div @click="onClickCounter">
    Pinia：你点击了 {{ counter.count }} 次
  </div>
</template>

<style>
@import './index.css';
</style>
