<template>
  <div class="cv4i_basic">
    <div class="cv4i_basic_logo">
      <div class="image">
        <img :src="companyData.logo" />
      </div>
      <div class="content">
        <div>
          <h3>{{ companyData.cname }}</h3>
          <p>
            <span class="type" v-if="companyTypeName">{{
              companyTypeName
            }}</span>
          </p>
        </div>
      </div>
    </div>
    <dl class="cv4i_basic_info">
      <dt>基本信息</dt>
      <dd v-for="o in list" :key="o.key">
        <label>{{ o.label }}</label>
        <div
          :class="{
            content: true,
            [o.key]: true,
            introduction_fold: o.key === 'introduction' && !isShowIntroduction,
          }"
          @click="onClickItem(o)"
        >
          <div class="tx">{{ o.value }}</div>
          <p class="more" v-if="o.key === 'introduction' && o.value">
            <span @click="isShowIntroduction = !isShowIntroduction">
              <em>{{ isShowIntroduction ? '收起' : '展开' }}</em>
              <i
                :class="[
                  'iconfont',
                  isShowIntroduction ? 'icon-arrows_up' : 'icon-arrows_down',
                ]"
              ></i>
            </span>
          </p>
        </div>
      </dd>
    </dl>
  </div>
</template>
<script>
export default {
  props: {
    companyData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isShowIntroduction: false,
    };
  },
  computed: {
    companyTypeName() {
      const typeMap = {
        property: '财产险公司',
        lift: '人身险公司',
      };
      return typeMap[this.companyData.comType] || '';
    },
    list() {
      return [
        { key: 'ename', label: '英文名' },
        { key: 'cname', label: '简称' },
        { key: 'introduction', label: '简介' },
        { key: 'phone', label: '客服电话' },
        { key: 'webUrl', label: '官网' },
        { key: 'registeredCapitalFormat', label: '注册资金' },
        { key: 'registeredDate', label: '注册时间' },
        { key: 'address', label: '地址' },
      ].map(e => {
        e.value = this.companyData[e.key] || '';
        return e;
      });
    },
  },
  methods: {
    onClickItem(item) {
      if (item.key === 'webUrl' && item.value) {
        location.href = item.value;
      }
    },
  },
};
</script>
<style scoped>
@import './basic.css';
</style>
