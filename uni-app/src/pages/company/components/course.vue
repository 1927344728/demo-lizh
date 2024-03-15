<template>
  <view v-if="list && list.length" class="cv4i_course">
    <view class="cv4i_course_dl">
      <view class="cv4i_course_dt">
				<text>发展历程</text>
			</view>
      <view class="cv4i_course_dd"
        v-for="(item, i) in list.filter((e, i) => isShowMore || i < 5)"
        :key="item.description + i"
      >
        <view class="year">
          <text>{{ item.year }}年</text>
        </view>
        <view class="desc">
					<text>{{ item.description }}</text>
				</view>
      </view>
    </view>
    <view v-if="list.length > 5" class="tips" @click="isShowMore = !isShowMore">
			<text>{{ isShowMore ? '收起' : '查看更多' }}</text>
      <text
        :class="[
          'iconfont',
          isShowMore ? 'icon-arrows_up' : 'icon-arrows_down',
        ]"
      ></text>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: Array,
  },
  data() {
    return {
      isShowMore: false,
    };
  },
};
</script>
<style>
.cv4i_course {
  margin-top: 24px;
  padding-bottom: 24px;
  background: white;
  border-radius: 18px;
  font-size: 28px;
  line-height: 1.5;
  & .cv4i_course_dl {
    & .cv4i_course_dt {
      margin-bottom: 18px;
      padding: 24px;
      font-size: 34px;
      font-weight: bold;
      border-bottom: 1px solid #e5e5e5;
    }
    & .cv4i_course_dd {
      display: flex;
      padding: 24px 24px 18px 24px;
      & .year {
        flex: 0 0 120px;
        margin-right: 24px;
        & span {
          display: inline-block;
          padding: 6px 16px;
          font-size: 26px;
          line-height: normal;
          color: white;
          background: #fe7c00;
          border-radius: 6px;
        }
      }
      & .desc {
        flex: 1;
      }
    }
  }
  & .tips {
    padding: 14px;
    font-size: 26px;
    color: #999999;
    text-align: center;
    & .iconfont {
      font-size: 26px;
    }
  }
}
</style>
