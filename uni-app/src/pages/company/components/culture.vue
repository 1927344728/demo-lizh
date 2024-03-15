<template>
  <view v-if="list && list.length" class="cv4i_culture">
    <view class="cv4i_culture_dl">
      <view class="cv4i_culture_dt">
				<text>企业文化</text>
			</view>
      <dd v-for="(item, i) in list" :key="item.key + i" class="cv4i_culture_dd">
        <view class="key">
          <text>{{ item.key }}</text>
        </view>
        <view class="desc">
					<text>{{ item.value }}</text>
				</view>
      </dd>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: Array,
  },
};
</script>
<style>
.cv4i_culture {
  margin-top: 24px;
  padding-bottom: 24px;
  background: white;
  border-radius: 18px;
  font-size: 28px;
  line-height: 1.5;
  & .cv4i_culture_dl {
    & .cv4i_culture_dt {
      margin-bottom: 18px;
      padding: 24px;
      font-size: 34px;
      font-weight: bold;
      border-bottom: 1px solid #e5e5e5;
    }
    & .cv4i_culture_dd {
      display: flex;
      padding: 24px 24px 18px 24px;
      & .key {
        flex: 0 0 140px;
        margin-right: 24px;
        & span {
          display: inline-block;
          padding: 6px 16px;
          font-size: 26px;
          line-height: normal;
          color: white;
          background: #0a64fe;
          border-radius: 6px;
        }
      }
      & .desc {
        flex: 1;
      }
    }
  }
}
</style>
