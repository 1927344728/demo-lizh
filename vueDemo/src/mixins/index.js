/* 
* @Author: lizh
* @Date:   2020-11-06 09:50:49
* @Last Modified by:   lizh
* @Last Modified time: 2020-11-06 10:30:53
*/

'use strict';
import {
  PB_TYPE,
  PLANBOOK_ID,
  RESULT_UUID,
  STORAGE_UUID,
  URL_PARAM,
  IS_BXS_APP,
  IS_BROKER_APP,
  IS_JYY_APP
} from '@/utils/variables.js'
export default {
  data () {
    return {
      URL_PARAM,
      PB_TYPE,
      PLANBOOK_ID,
      RESULT_UUID,
      STORAGE_UUID,
      IS_BXS_APP,
      IS_BROKER_APP,
      IS_JYY_APP
    }
  },
  created () {
    this.window = window
    this.Jax = window.Jax
  }
}