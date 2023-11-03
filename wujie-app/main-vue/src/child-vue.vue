<template>
  <WujieVue
    width="100%"
    height="100%"
    name="child-vue-app"
    url="//localhost:9911/"
    :sync="true"
    :props="{
      name: 'Lizhao'
    }"
  />
</template>
<script>
import WujieVue from 'wujie-vue2';
const { bus } = WujieVue;
window.timestamp = new Date().getTime();
setInterval(() => {
  bus.$emit('update', new Date().getTime());
}, 2000);
export default {
  components: {
    WujieVue
  }
};
</script>
