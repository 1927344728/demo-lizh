<template>
  <footer class="input2-footer">
    <ul>
      <li>
        <div class="footer-info">
          <p class="footer-info-title">首年总保费</p>
          <p class="footer-info-baofei">{{totalBaoFei.toFixed(2).split('.')[0]}}<em>.{{totalBaoFei.toFixed(2).split('.')[1]}}元</em></p>
        </div>
      </li>
      <li>
        <span class="footer-btn" @click="createPlanbook">生成计划书</span>
      </li>
    </ul>
  </footer>
</template>
<script>
import {
  calcTotalBaof
} from 'bxs-tools-ui/lib/utils.js'

export default {
  name: 'InputFooter',
  data () {
    return {

    }
  },
  props: {
    inputData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  computed: {
    totalBaoFei () {
      return calcTotalBaof(this.inputData.productGroupList)
    }
  },
  created() {
  },
  methods: {
    createPlanbook () {
      this.$emit('createPlanbook')
    }
  }
}
</script>
<style>
  @import 'base_style.css';
  @import 'variables.css';
  .input2-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 100;
    border-top: 1PX solid var(--gray_e5);
    background: var(--gray_f8);
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    box-sizing: content-box;
    & ul {
      display: flex;
      padding: 6px 10px;
      line-height: normal;
      & li {
        flex: 2;
        & .footer-info {
          color: var(--gray_666);
          & .footer-info-title {
            margin-top: 2px;
            font-size: 12px;
          }
          & .footer-info-baofei {
            font-size: 20px;
            color: var(--main_color);
            & em {
              font-size: 12px;
            }
          }
        }
        & .footer-btn {
          padding: 10px 12px;
          background: var(--main_color);
          border-radius: 6px;
          color: #fff;
          font-size: 13px;
        }
        &:last-child {
          display: flex;
          flex: 1;
          justify-content: flex-end;
          align-items: center;
        }
      }
    }
  }
</style>
