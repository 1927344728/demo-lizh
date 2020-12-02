<template>
  <div class="planbook_input2" v-if="inputData">
    <div class="input2_person">
      <div class="input2_person_container">
        <template v-for="person in personData.personOrderList">
          <PersonInfo
            :key="person.key"
            :person-data="person"
            @change="changePersonInfo"
          ></PersonInfo>
        </template>
      </div>
    </div>
    <div class="input2_product">
      <template v-for="g in inputData.productGroupList">
        <template v-for="p in g.prodOrderList">
          <ProductTable
            :key="p.key"
            :product-data="p"
            :insurance-context="{
              groupKey: g.key,
              productKey: p.key
            }"
            @modify="modifyProduct"
            @confirm="confirmProduct"
            @close="overlayClose"
          ></ProductTable>
        </template>
      </template>
    </div>
    <InputFooter :input-data="inputData" @createPlanbook="createPlanbook"></InputFooter>
  </div>
</template>
<script>
import QS from 'qs'
import {
    getPlanBookInitData,
    calculateProduct,
} from '@/api/planbook'
import {
  PersonInfo
} from 'bxs-tools-ui'
import {
  personDataHandler
} from 'bxs-tools-ui/lib/utils.js'
import {
  initPageData,
  createdProductDataToCalc,
  receiveProductData
} from './helper.js'
import ProductTable from './components/product-table.vue'
import InputFooter from './components/footer.vue'
export default {
  name: 'app',
  components: {
		PersonInfo,
    ProductTable,
    InputFooter
  },
  data() {
    return {
      planbookData: null,
    }
  },
  created() {
    let self = this
    getPlanBookInitData({
        insuranceTypeId: self.PLANBOOK_ID
    }).then(res => {
        if (res.success && res.data) {
          self.planbookData = initPageData(res.data)
        }
    })
  },
  computed: {
    inputData () {
      return this.planbookData && this.planbookData.initData && this.planbookData.initData.inputData
    },
    personData () {
      return this.inputData.personData
    }
  },
  methods: {
    changePersonInfo (person, ele) {
    },
    modifyProduct (prod, options, inst) {
    },
    overlayClose () {
      this.insuranceContext = null
    },
    confirmProduct (prod, options, inst) {
      let self = this
      inst.$refs.productInfo.validate().then(valid => {
        return createdProductDataToCalc(self.inputData, {
          planbookId: 6128,
          groupKey: options.insuranceContext.groupKey,
          productKey: options.insuranceContext.productKey
        }).then(calcData => {
          return calculateProduct(QS.stringify(calcData)).then(res => {
            if (res.data) {
              res.data.productGroupList.map(g => {
                g.prodOrderList.map(p => {
                  receiveProductData(self.inputData, p, {
                    planbookId: 6128,
                    groupKey: options.insuranceContext.groupKey,
                    productKey: options.insuranceContext.productKey
                  })
                })
              })
              inst.isShowProductSheet = false
            }
            console.log(res);
          }).catch(function (error) {
            console.log(error);
          })
        }).catch(err => {
          debugger
        })
      })
    },
    createPlanbook () {}
  }
}
</script>
<style>
  .planbook_input2 {
    font-size: 15px;
    & .input2_person {
      padding: 9px;
      & .input2_person_container {
        border-radius: 6px;
        overflow: hidden;
      }
    }
    & .input2_product {
      padding: 9px;
    }
  }
</style>