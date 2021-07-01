import Vue from 'vue'
import {
  URL_PARAM
} from '@/utils/variables'
export default Vue.extend({
  data () : any {
    return {
      URL_PARAM
    }
  },
  created () : any {
    this.Jax = window.Jax
    this.window = window
  }
})
