<template>
  <div id="Pie"></div>
</template>
<script>
import * as echarts from 'echarts';

export default {
  mounted() {
    this.initPie();
  },
  methods: {
    initPie() {
      const chartDom = document.getElementById('Pie');
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        // legend: {
        //   bottom: 10,
        //   left: 'center',
        //   data: ['CityA', 'CityB', 'CityD', 'CityC', 'CityE']
        // },
        series: [
          {
            type: 'pie',
            radius: '45%',
            labelLine: {
              length: 15,
            },
            data: [
              { value: 1548, name: 'CityE' },
              { value: 735, name: 'CityC' },
              { value: 510, name: 'CityD' },
              { value: 434, name: 'CityB' },
              { value: 335, name: 'CityA' },
            ],
            label: {
              formatter: parmas => {
                return [
                  `{title|${parmas.name}}`,
                  '{hr|}',
                  `{value|机构：${parmas.value}}`,
                ].join('\n');
              },
              backgroundColor: '#F6F8FC',
              borderColor: '#8C8D8E',
              borderWidth: 1,
              borderRadius: 4,
              padding: [5, 10],
              rich: {
                title: {
                  color: '#6E7079',
                  lineHeight: 22,
                  align: 'center',
                },
                hr: {
                  borderColor: '#8C8D8E',
                  width: '100%',
                  borderWidth: 1,
                  height: 0,
                },
                value: {
                  color: '#4C5058',
                  fontSize: 14,
                  fontWeight: 'bold',
                  lineHeight: 22,
                  align: 'center',
                },
              },
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
      myChart.setOption(option);
    },
  },
};
</script>
<style>
#Pie {
  height: 640px;
}
</style>
