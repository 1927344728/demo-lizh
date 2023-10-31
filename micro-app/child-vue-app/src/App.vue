<template>
  <header>Hello, {{ state.userName }}</header>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>
<script setup>
import { reactive } from 'vue';
const state = reactive({
  userName: ''
});
if (window.microApp) {
  state.userName = window.microApp.getData().userName;
  window.microApp.addDataListener(data => {
    state.userName = data.userName;
    window.microApp.dispatch({
      message: `Got data!${new Date().getTime()}`
    });
  });
}
</script>
