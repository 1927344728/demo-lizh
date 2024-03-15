<template>
  <view class="cv4i_organization">
    <view class="cv4i_organization_header">
      <view class="title">
        <text class="name">分支机构</text>
        <text class="problem" @click.stop="isShowTips = !isShowTips">
          <text class="iconfont icon-common_problem"></text>
          <text v-if="isShowTips" class="problem_tips">
            1、机构分布统计中，因为地图显示内容大小，只统计分公司、中心支公司、支公司；<br /><br />
            2、地图显示过多数据会影响视觉观感，所以会只显示市级机构；
          </text>
        </text>
      </view>
      <view class="tips">
        <text>机构分布</text>
        <hr />
        <text>可以放大、拖动</text>
      </view>
    </view>
    <view class="cv4i_organization_map">
      <view class="wrapper"></view>
      <view class="tips">
        <view class="tips_li">
          <label>覆盖省份：</label>
          <text>{{ provinceNum }}</text>
        </view class="tips_li">
        <view class="tips_li">
          <label>分公司：</label>
          <text>{{ companyData.orgBranchCount || 0 }}</text>
        </view class="tips_li">
        <view class="tips_li">
          <label>市县级分支机构：</label>
          <text>{{ companyData.orgSubCount || 0 }}</text>
        </view class="tips_li">
      </view>
    </view>
    <view class="cv4i_organization_tips">
      地图显示过多数据会影响视觉观感，所有会只显示市级机构
    </view>
  </view>
</template>
<script>
import { get as _get } from 'lodash';
import * as echarts from 'echarts';
import { URL_PARAM } from '@/utils/variables.js';

export default {
  props: {
    companyData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isShowTips: false,
    };
  },
  computed: {
    provinceNum() {
      return _get(this.companyData, 'orgProvinceList.length', 0);
    },
  },
  mounted() {
    document.addEventListener(
      'click',
      () => {
        this.isShowTips = false;
      },
      false
    );
    this.initChinaMap();
  },
  methods: {
    initChinaMap() {
      const _orgProvinceList =
        _get(this.companyData, 'orgProvinceList', []) || [];
      const _orgCityList = _get(this.companyData, 'orgCityList', []) || [];
      const chartDom = document.querySelector(
        '.cv4i_organization_map .wrapper'
      );
      const myChart = echarts.init(chartDom);
      myChart.showLoading();
      return fetch(
        'https://res.winbaoxian.com/autoUpload/planbook/china_geo_d2acc0c8bd0780e.json'
      )
        .then(data => data.json())
        .then(data => {
          const provinces = data.features.map(e => e.properties);
          const mapSerie = _orgProvinceList.map(e => {
            const item = provinces.find(o => o.code === Number(e.areacode));
            return {
              ...e,
              name: item ? item.name : e.cname,
              value: e.childrenCount,
            };
          });
          const max = mapSerie.reduce(
            (max, e) => Math.max(max, e.value || 0),
            0
          );
          const scatterSerie = _orgCityList.map(e => {
            return {
              ...e,
              name: e.cname,
              value: (e.areacenter || [])
                .map(e => Number(e))
                .concat(e.childrenCount),
              visualMap: false,
            };
          });

          const _cityCode = _get(
            this.companyData,
            'cityCode',
            URL_PARAM.cityCode
          );
          const _localCityCode = _cityCode ? Number(_cityCode) : null;
          let localCity = scatterSerie.find(
            e => Number(e.areacode) === _localCityCode
          );
          if (localCity) {
            const index = scatterSerie.findIndex(
              e => e.areacode === localCity.areacode
            );
            localCity = scatterSerie.splice(index, 1)[0];
            localCity.symbolSize = 12;
            localCity.itemStyle = {
              color: '#FFFC00',
              borderColor: 'rgba(255, 0, 0, 0.5)',
              borderWidth: 3,
            };
            scatterSerie.push(localCity);
          }

          echarts.registerMap('CHINA', data);
          const option = {
            geo: {
              map: 'CHINA',
              roam: true,
              center:
                localCity && localCity.areacenter
                  ? localCity.areacenter.map(e => Number(e))
                  : [103, 29],
              zoom: localCity ? 10 : 1.15,
              scaleLimit: {
                min: 1.15,
                max: 15,
              },
              itemStyle: {
                borderColor: '#D1D1D1',
              },
              emphasis: {
                label: {
                  show: true,
                },
                itemStyle: {
                  areaColor: '#FFB51B',
                },
              },
              select: {
                itemStyle: {
                  areaColor: '#FFB51B',
                },
              },
            },
            tooltip: {
              trigger: 'item',
              showDelay: 0,
              transitionDuration: 0.2,
            },
            visualMap: {
              left: 16,
              bottom: 6,
              min: 1,
              max,
              itemWidth: 15,
              itemHeight: 80,
              align: 'left',
              inRange: {
                color: ['#879EFC', '#334487'],
              },
              text: ['机构数量'],
              textGap: 10,
              calculable: true,
            },
            series: [
              {
                name: '中图',
                type: 'map',
                geoIndex: 0,
                map: 'CHINA',
                data: mapSerie,
                tooltip: {
                  confine: true,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderWidth: 0,
                  formatter: params => {
                    const {
                      cname,
                      name,
                      approveTime,
                      approveAgency,
                      value,
                    } = params.data;
                    return `<div class="cv4i_organization_chart_tips">
                      <p class="title">${cname}</p>
                      <p>所属省份：${name}</p>
                      <p>批准日期：${approveTime}</p>
                      <p>发证机关：${approveAgency}</p>
                      <p>该省机构数：${value}</p>
                    </div>`;
                  },
                },
              },
              {
                name: '机构分布',
                type: 'scatter',
                coordinateSystem: 'geo',
                geoIndex: 0,
                data: scatterSerie,
                itemStyle: {
                  color: '#FFE531',
                },
                encode: {
                  value: 2,
                },
                symbolSize: 6,
                tooltip: {
                  confine: true,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderWidth: 0,
                  formatter: params => {
                    const {
                      cname,
                      areaname,
                      approveTime,
                      approveAgency,
                    } = params.data;
                    return `<div class="cv4i_organization_chart_tips">
                      <p class="title">${cname}</p>
                      <p>分公司地区：${areaname}</p>
                      <p>批准日期：${approveTime}</p>
                      <p>发证机关：${approveAgency}</p>
                    </div>`;
                  },
                },
              },
            ],
          };
          myChart.hideLoading();
          myChart.setOption(option);
        });
    },
  },
};
</script>
<style>
@import './organization.css';
</style>
