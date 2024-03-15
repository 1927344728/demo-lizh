<template>
  <view v-if="isLoaded">
    <view class="companyv4_index" v-if="companyData">
      <CompanyBasic :companyData="companyData" />
      <CompanyShareholder :company-logo="companyData.logo" />
      <CompanyOrganization
        v-if="companyData.orgCityList && companyData.orgCityList.length"
        :companyData="companyData"
      />
      <CompanyRisk
        v-if="companyData.latestRiskData"
        :companyData="companyData"
      />
      <CompanyCourse
        v-if="companyData.developPathDTOS && companyData.developPathDTOS.length"
        :list="companyData.developPathDTOS"
      />
      <CompanyCulture
        v-if="companyData.cultureDTOS && companyData.cultureDTOS.length"
        :list="companyData.cultureDTOS"
      />
      <CompanyHonor
        v-if="companyData.honors && companyData.honors.length"
        :list="companyData.honors"
      />
    </view>
    <!-- <bxs-default-page v-else :large="!0" /> -->
  </view>
</template>

<script>
// import '@/mock/index.js';
import QS from 'qs';
import {
  getSimpleCurrentUser2C,
  getCompanyDetailV4,
  wxClientSaveOperate,
} from '@/api';
import { initBasicConfig } from '@/utils/index.js';
import { initShareAction } from '@/utils/shareActions@1.1.0.js';
import { oCheckUserInfoExists } from '@/utils/wxAuthorize@1.1.0.js';
import {
  URL_PARAM,
  COMMON_PARAM,
  WX_GUANJIA_MP_ID,
} from '@/utils/variables.js';

import CompanyBasic from './components/basic.vue';
import CompanyOrganization from './components/organization.vue';
import CompanyRisk from './components/risk.vue';
import CompanyCourse from './components/course.vue';
import CompanyCulture from './components/culture.vue';
import CompanyHonor from './components/honor.vue';
import CompanyShareholder from './components/shareholder.vue';
export default {
  components: {
    CompanyBasic,
    CompanyOrganization,
    CompanyRisk,
    CompanyCourse,
    CompanyCulture,
    CompanyHonor,
    CompanyShareholder,
  },
  filters: {
    formatNumber(n) {
      return n && (n * 1).toLocaleString();
    },
  },
  data() {
    return {
      isLoaded: false,
      companyData: {},
    };
  },
  async created() {
    initBasicConfig({
      statSDKPageId: 'GSJS_V4_SY',
      pageWrapperDom: document.body,
    });
    await this.getCompanyDetailV4();
    await this.getSimpleCurrentUser2C();
    // this.fnWxClientSaveOperate();
  },
  methods: {
    getCompanyDetailV4() {
      this.isLoaded = false;
      return getCompanyDetailV4(URL_PARAM.companyId)
        .then(({ success, data }) => {
          if (!success || !data) {
            return;
          }
          this.companyData = data;
        })
        .finally(() => {
          this.isLoaded = true;
        });
    },
    getSimpleCurrentUser2C() {
      if (URL_PARAM.fromWyjhs === '1') {
        return;
      }
      return getSimpleCurrentUser2C({
        uuid: URL_PARAM.uuid,
      }).then(({ success, data }) => {
        if (!success || !data) {
          return;
        }
        const shareUrl =
          `${location.origin}${location.pathname}?` +
          QS.stringify({
            companyId: URL_PARAM.companyId,
            uuid: URL_PARAM.uuid || data.uuid,
          });
        initShareAction({
          title: `${this.companyData.cname}公司介绍`,
          content: `${data.name}老师推荐您查看保险公司的全景资料，请查阅！`,
          imgUrl: 'https://media.winbaoxian.com/autoUpload/common/3343a609-86ea-46e9-a962-703ef7ec8a5d.png',
          shareUrl,
          options: {
            title: '转发后您可在客户动态栏目了解客户动向。',
          },
        });
      });
    },
    fnWxClientSaveOperate() {
      const { companyData } = this;
      const { fromWyjhs, companyId, uuid } = URL_PARAM;
      const { APP_ID } = COMMON_PARAM;
      if (window.appBridge && !window.appBridge.isWechat()) {
        return;
      }
      if (fromWyjhs === '1') {
        return;
      }
      return oCheckUserInfoExists().then(({ token }) => {
        const jumpUrl =
          `${location.origin}${location.pathname}?` +
          QS.stringify({
            companyId,
          });
        wxClientSaveOperate({
          appId: WX_GUANJIA_MP_ID, // 微信公众号ID
          token,
          userAppId: APP_ID, // 保险师|独代|tob APP ID
          userStrId: uuid, // A端用户uuid
          source: 34,
          operate: 'view',
          linkId: companyId, // 用于转发链
          dynamicMsg: [companyData ? companyData.name : ''], // 获客行为动态文案
          previousOperateUuid: null, // 用于转发链
          jumpUrl,
        });
      });
    },
  },
};
</script>

<style>
@import './index.css';
</style>
