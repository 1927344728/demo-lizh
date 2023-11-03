<template>
  <div id="app">
    {{ message }}
    <p class="App-link">aaa</p>
    <router-view />
  </div>
</template>
<script>
export default {
  data() {
    return {
      message: ''
    };
  },
  mounted() {
    const self = this;
    setTimeout(() => {
      if (window.document.querySelector('iframe[name=child-vue-app]')) {
        self.message = window.document.querySelector(
          'iframe[name=child-vue-app]'
        ).contentWindow.messageForMainApp;
      }
    }, 2000);
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
