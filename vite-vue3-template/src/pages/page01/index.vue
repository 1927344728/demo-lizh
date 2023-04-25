<script setup>
import { reactive, onMounted } from 'vue'

const reactData = reactive({
  count: 1
})

onMounted(() => {
  console.log('onMounted')
})
</script>

<template>
  <div class="page01_index">
    多页面应用：{{ reactData.count }}
  </div>
</template>

<style>
@import './index.css';
</style>
