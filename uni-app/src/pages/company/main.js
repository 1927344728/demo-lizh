import Vue from 'vue';
import App from './app.vue';
// import FastClick from 'fastclick';

import Mixin from '@/mixins/index.js';

// FastClick.attach(document.body);
Vue.config.productionTip = false;

Vue.mixin(Mixin);
new Vue({
  el: '#app',
  render: h => h(App),
});
