import {
  IS_PRODUCT,
  URL_PARAM
} from '@/utils/variables'
export default {
  data () {
    return {
      COMMON_PARAM: {
        IS_PRODUCT,
      },
      URL_PARAM
    }
  },
  created () {
    this.Jax = Jax
    this.window = window
  }
}