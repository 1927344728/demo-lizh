<template>
  <div class="input2-product-show" v-if="productData">
    <div class="input2-product-show-container" :key="productData.key">
      <header class="input2-product-header">
        <p class="input2-product-header-title">{{productData.titleName}}</p>
        <div class="input2-product-header-btn">
          <bxs-button size="mini" plain @click="modify(productData)">修改</bxs-button>
        </div>
      </header>
      <div class="input2-product-body">
        <h5 class="input2-product-baof">首年保费：{{productData.totalBaof}}</h5>
        <table class="input2-product-table" v-if="productData.hadChoice && productData.insShowArr">
          <template v-for="tr in productData.insShowArr">
            <tr :key="JSON.stringify(tr)">
              <template v-for="td in tr">
                <td :key="JSON.stringify(tr) + td">{{td}}</td>
              </template>
            </tr>
          </template>
        </table>
      </div>
    </div>
    <bxs-bottom-sheets
      class="product-sheets"
      :key="`sheets-${productData.key}`"
      v-model="isShowProductSheet"
      :title="productData.titleName"
      height="middle"
      @overlayClose="overlayClose"
    >
      <div>
        <ProductInfo
          ref="productInfo"
          :product-data="productData"
        ></ProductInfo>
      </div>
      <div slot="footer" class="product-sheets-footer">
        <bxs-button size="large" @click="confirm(productData)">确定</bxs-button>
      </div>
    </bxs-bottom-sheets>
  </div>
</template>
<script>
import {
  BottomSheets,
  Button
} from 'bxs-ui-vue'
import {
  ProductInfo
} from 'bxs-tools-ui'

export default {
  name: 'ProductTable',
  components: {
    [BottomSheets.name]: BottomSheets,
    [Button.name]: Button,
    ProductInfo
  },
  data () {
    return {
      isShowProductSheet: false
    }
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {}
      }
    },
    insuranceContext: {
      type: Object,
      default () {
        return {}
      }
    },
  },
  watch: {
    isShowProductSheet: {
      immediate: true,
      deep: true,
      handler (val, oldVal) {
        if (!val) {
          this.overlayClose()
        }
      }
    }
  },
  created() {
  },
  methods: {
    modify (prod) {
      this.isShowProductSheet = true
      this.$emit('modify', prod, {
        insuranceContext: {...this.insuranceContext}
      }, this)
    },
    overlayClose () {
      this.$emit('close')
    },
    confirm (prod) {
      this.$emit('confirm', prod, {
        insuranceContext: {...this.insuranceContext}
      }, this)
    }
  }
}
</script>
<style>
  @import 'base_style.css';
  @import 'variables.css';
  .input2-product-show {
    & .input2-product-show-container {
      padding: 12px;
      background: #fff;
      border-radius: 6px;
      & .input2-product-header {
        position: relative;
        font-size: 18px;
        font-weight: bold;
        & .input2-product-header-title {
          @mixin nowrap;
          width: 80%;
        }
        & .input2-product-header-btn {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
        }
      }
      & .input2-product-body {
        & .input2-product-baof {
          line-height: 32px;
          font-size: 15px;
          font-weight: normal;
        }
        & .input2-product-table {
          width: 100%;
          margin-top: 12px;
          font-size: 14px;
          color: var(--color-text-patch);
          border-spacing: 0;
          & tr {
            & td {
              padding: 6px 6px;
              border-top: 1PX solid var(--color-text-assist);
              border-left: 1PX solid var(--color-text-assist);
              &:nth-child(4) {
                text-align: center;
              }
              &:last-child {
                border-right: 1PX solid var(--color-text-assist);
              }
            }
            &:first-child {
              & td {
                text-align: center;
              }
            }
            &:last-child {
              & td {
                border-bottom: 1PX solid var(--color-text-assist);
              }
            }
          }
        }
      }
    }
    & .product-sheets {
      & .bx-sheets-content {
        background: #f2f2f2;
      }
      & .product-sheets-footer {
        padding: 9px;
      }
    }
  }
</style>
