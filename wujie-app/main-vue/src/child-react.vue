<template>
  <WujieVue
    width="100%"
    height="100%"
    name="vite"
    url="//localhost:9912/"
    :sync="true"
  ></WujieVue>
</template>
<script>
import WujieVue from 'wujie-vue2';
export default {
  components: {
    WujieVue
  }
};
</script>
