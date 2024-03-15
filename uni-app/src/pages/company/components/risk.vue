<template>
  <view class="cv4i_risk">
    <view class="cv4i_risk_header">
      <view class="title">
        <text>风险信息</text>
      </view>
      <view class="tips">
        <text>偿付能力</text>
      </view>
    </view>
    <view class="cv4i_risk_line"></view>
    <view class="cv4i_risk_info">
      <view v-for="o in list" :key="o.label" class="cv4i_risk_item">
        <label class="cv4i_risk_item_label">
					{{ o.label }}
				</label>
        <view :class="['wrapper', o.key]" @click="onClickItem(o)">
          <view
            :class="[
              'content',
              o.key === 'sarData.time' ? (time ? 'active' : 'disable') : '',
            ]"
          >
            <text class="tx">{{ o.value }}</text>
            <text
              v-if="o.key === 'sarData.time'"
              class="iconfont icon-arrows_right"
            ></text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import Vue from 'vue';
import { get as _get, cloneDeep } from 'lodash';
import * as echarts from 'echarts';

export default {
  props: {
    companyData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      time: _get(this.companyData, 'sarData[0].time') || '',
    };
  },
  computed: {
    seasonList() {
      const _sarData = _get(this.companyData, 'sarData', []) || [];
      return _sarData
        .map(e => e.time)
        .filter(e => !!e)
        .map(e => e.replace('-', '年') + '季度');
    },
    list() {
      const _sarData = _get(this.companyData, 'sarData', []) || [];
      const index = _sarData.findIndex(e => e.time === this.time);
      const timeStr = this.time
        ? this.time.replace('-', '年') + '季度'
        : '请选择报告季度';
      return [
        { key: 'sarData.time', label: '选择时间', value: timeStr },
        {
          key: `sarData[${index}].comprehensiveSar`,
          label: '综合偿付能力充足率',
        },
        { key: `sarData[${index}].coreSar`, label: '核心偿付能力充足率' },
        // { key: 'latestRiskData[0].recognizedAssets', label: '认可资产' },
        // { key: 'latestRiskData[0].recognizedLiabilities', label: '认可负债' },
      ].map(e => {
        if (e.key === 'sarData.time') {
          return e;
        }
        if (
          [
            `sarData[${index}].comprehensiveSar`,
            `sarData[${index}].coreSar`,
          ].includes(e.key)
        ) {
          e.value = _get(this.companyData, e.key)
            ? _get(this.companyData, e.key) + '%'
            : '-';
          return e;
        }
        e.value = _get(this.companyData, e.key) || '-';
        return e;
      });
    },
  },
  watch: {
    companyData: {
      deep: true,
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.initLine();
        });
      },
    },
  },
  mounted() {
    this.initLine();
  },
  methods: {
    onClickItem(item) {
      const self = this;
      if (item.key === 'sarData.time') {
        // self.$picker({
        //   title: '请选择报告季度',
        //   defaultValue: [
        //     self.time ? self.time.replace('-', '年') + '季度' : '',
        //   ],
        //   pickerData: self.seasonList,
        //   callback(backInfo) {
        //     if (backInfo.type === 'confirm') {
        //       self.time = backInfo.value.replace(/年/, '-').replace(/季度/, '');
        //       self.initLine();
        //     }
        //   },
        // });
      }
    },
    initLine() {
      const _sarData = cloneDeep(
        _get(this.companyData, 'sarData', []) || []
      ).reverse();
      const chartDom = document.querySelector('.cv4i_risk_line');
      if (!chartDom) {
        return;
      }
      const myChart = echarts.init(chartDom);
      const xAxisData = _sarData.map(e => e.time);
      const option = {
        legend: {
          data: ['综合偿付能力充足率', '核心偿付能力充足率'],
        },
        tooltip: {
          trigger: 'axis',
          alwaysShowContent: false,
          confine: true,
          valueFormatter: value => (value ? value + '%' : ''),
        },
        grid: {
          left: '16%',
          right: 15,
          top: 50,
          bottom: 30,
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            margin: 15,
          },
          boundaryGap: false,
          data: xAxisData,
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)',
            },
          },
          axisTick: {
            show: true,
            inside: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            margin: 15,
            formatter: '{value}%',
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.45)',
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
        color: ['#FE7900', '#0A64FE'],
        series: [
          {
            name: '综合偿付能力充足率',
            type: 'line',
            data: _sarData.map(e => e.comprehensiveSar),
            markLine: {
              data: [{ yAxis: 100, name: 'suggest', value: 100 }],
              symbol: 'none',
              lineStyle: {
                type: [5, 10],
                dashOffset: 5,
              },
              label: {
                show: false,
              },
            },
          },
          {
            name: '核心偿付能力充足率',
            type: 'line',
            data: _sarData.map(e => e.coreSar),
            markLine: {
              data: [{ yAxis: 50, name: 'suggest', value: 50 }],
              symbol: 'none',
              lineStyle: {
                type: [5, 10],
                dashOffset: 5,
              },
              label: {
                show: false,
              },
            },
          },
        ],
      };
      myChart.setOption(option);
      myChart.on('click', 'series.line', params => {
        if (params.name === 'suggest') {
          return;
        }
        this.time = params.name;
      });
    },
  },
};
</script>
<style scoped>
@import './risk.css';
</style>
