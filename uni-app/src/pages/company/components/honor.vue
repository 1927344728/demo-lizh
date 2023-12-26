<template>
  <div v-if="list && list.length" class="cv4i_honor">
    <dl>
      <dt>公司荣誉</dt>
      <dd
        v-for="(item, i) in list.filter((e, i) => isShowMore || i < 5)"
        :key="item.year + '' + i"
      >
        {{ item }}
      </dd>
    </dl>
    <p v-if="list.length > 5" class="tips" @click="isShowMore = !isShowMore">
      {{ isShowMore ? '收起' : '查看更多' }}
      <i
        :class="[
          'iconfont',
          isShowMore ? 'icon-arrows_up' : 'icon-arrows_down',
        ]"
      ></i>
    </p>
  </div>
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
.cv4i_honor {
  margin-top: 24px;
  padding-bottom: 24px;
  background: white;
  border-radius: 18px;
  font-size: 28px;
  line-height: 1.5;
  & dl {
    & dt {
      margin-bottom: 18px;
      padding: 24px;
      font-size: 34px;
      font-weight: bold;
      border-bottom: 1px solid #e5e5e5;
    }
    & dd {
      position: relative;
      padding: 24px 24px 18px 60px;
    }
    & dd::before {
      position: absolute;
      left: 24px;
      top: 36px;
      display: block;
      width: 14px;
      height: 14px;
      background: #fe7c00;
      border-radius: 14px;
      content: '';
    }
    & dd:not(:last-child)::after {
      position: absolute;
      left: 30px;
      top: 36px;
      display: block;
      width: 2px;
      height: 100%;
      background: #fe7c00;
      content: '';
    }
  }
  & .tips {
    padding: 14px;
    font-size: 26px;
    color: #999999;
    text-align: center;
    & i {
      font-size: 26px;
    }
  }
}
</style>
