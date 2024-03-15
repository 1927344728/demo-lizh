<template>
  <view class="cv4i_basic">
    <view class="cv4i_basic_logo">
      <image class="image" :src="companyData.logo" mode="aspectFit" />
      <view class="content">
				<view class="company_name">
					<text >{{ companyData.cname }}</text>
				</view>
				<view class="company_type">
					<text v-if="companyTypeName" class="company_type_text">
						{{companyTypeName}}
					</text>
				</view>
      </view>
    </view>
    <view class="cv4i_basic_info">
      <view class="cv4i_basic_title">
				<text>基本信息</text>
			</view>
      <view v-for="o in list" :key="o.key" class="cv4i_basic_item">
        <label class="cv4i_basic_item_label">
					{{ o.label }}
				</label>
        <view
          :class="{
            content: true,
            [o.key]: true,
            introduction_fold: o.key === 'introduction' && !isShowIntroduction,
          }"
          @click="onClickItem(o)"
        >
          <view class="tx">{{ o.value }}</view>
          <view class="more" v-if="o.key === 'introduction' && o.value">
            <text @click="isShowIntroduction = !isShowIntroduction">
              <text>{{ isShowIntroduction ? '收起' : '展开' }}</text>
              <text 
                :class="[
                  'iconfont',
                  isShowIntroduction ? 'icon-arrows_up' : 'icon-arrows_down',
                ]"
              ></text>
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
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
