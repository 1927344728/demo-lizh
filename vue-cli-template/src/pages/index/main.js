import Vue from 'vue';
import App from './app.vue'
import Mixinx from '@/mixins'
import store from '@/store/index.js'

import * as Sentry from "@sentry/vue"
import { Integrations } from "@sentry/tracing"
import WeiyiVue from './integration.js'
Sentry.init({
  Vue,
  dsn: "https://836aa622a237418e87dac2cc5dad0844@o1064742.ingest.sentry.io/6055794",
  // dsn: "https://219f7894b9aa4239a2f73e0d8ef3d5e3@sentry.winbaoxian.com/52",
  integrations: [new WeiyiVue(Vue)],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

setTimeout(() => {
  Sentry.setTag('ErrorType', 'Static Resource')
  Sentry.captureMessage(`静态资源加载出错：`, 'fatal')
}, 2000)

Vue.config.productionTip = false
Vue.mixin(Mixinx)
new Vue({
  store,
  render: h => h(App)
}).$mount('#app')