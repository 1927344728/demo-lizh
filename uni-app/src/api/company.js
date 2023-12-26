import request from './request.js';

export function getCompanyDetailV4(id) {
  return request({
    url: `/planBook/common/companyDetail/${id}`,
  });
}

export function getCompanyHolderShare(id) {
  return request({
    url: `/planBook/common/companyHolderShare/${id}`,
  });
}
