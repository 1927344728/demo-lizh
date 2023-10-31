<template>
  <div>
    <p v-if="state.message">基座应用：{{state.message}}</p>
    <micro-app
      name='child-vue-app'
      url='http://localhost:9901/'
      baseroute='/child-vue-app'
      :data="state"
      @datachange='handleDataChange'
    />
  </div>
</template>
<script setup>
import micro from '@micro-zoe/micro-app'
import { reactive } from 'vue'
const state = reactive({
  message: '',
  userName: 'Lizhao'
})
setInterval(() => {
  micro.setData('child-vue-app', {
    userName: 'Lizhao. ' + new Date().getTime()
  })
}, 2000);

function handleDataChange (event) {
  if (event.detail.data) {
    state.message = event.detail.data.message
  }  
}
</script>