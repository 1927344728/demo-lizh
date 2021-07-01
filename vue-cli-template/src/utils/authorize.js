import { checkUserInfoExists, weixinUserinfo } from '@/api';
import {
  IS_PRODUCT
} from '@/utils/variables.js'
import { setUrlParams } from '@/utils';
import Guid from 'guid';

const bApp = appBridge.isApp();
const inWechat = /micromessenger/.test(navigator.userAgent.toLowerCase());
const appid = IS_PRODUCT ? 'wxc4e379b0c2428c89' : 'wxf8ec50eb2ffc8551';
const boxUrl = IS_PRODUCT ? 'https://wx.winbaoxian.com' : 'https://box-api.winbaoxian.cn';
const redirectUrl = `${boxUrl}/box/wx/authorizeUserInfoWithCode?return_url=RETURN_URL`;
const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=REDIRECT_URL&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;

export function getToken() {
  let token = localStorage.getItem('WeiyiStat_pb_token_openid');
  if (!token) {
    token = Guid.create().value;
    localStorage.setItem('WeiyiStat_pb_token_openid', token);
  }
  return token;
}

export function oCheckUserInfoExists() {
  if (bApp || !inWechat) {
    return Promise.reject('请在微信下打开');
  }
  return checkUserInfoExists({
    token: getToken(),
    appId: appid,
  }).then(res => {
    if (res.code === 400) {
      return oWeixinAuthorize(); //未授权
    } else {
      return Promise.resolve({
        token: getToken(),
        appId: appid,
      }); //已授权
    }
  });
}
export function oWeixinAuthorize() {
  const _return_url = setUrlParams(
    {
      token: getToken(),
    },
    location.href
  );
  const goOauthUrl = authUrl.replace(
    /REDIRECT_URL/,
    encodeURIComponent(
      redirectUrl.replace(/RETURN_URL/, encodeURIComponent(_return_url))
    )
  );
  location.href = goOauthUrl;
  return Promise.reject();
}

export function oWeixinUserinfo() {
  return weixinUserinfo({
    token: getToken(),
    appid,
  }).then(res => {
    if (res.success && res.extObject) {
      return Promise.resolve(res.extObject);
    } else {
      return Promise.reject(res);
    }
  });
}
