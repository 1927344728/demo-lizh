import request from '@/utils/request'

/**
 * 获取投保页初始化数据
 * @Author   Lizh
 * @DateTime 2019-12-10
 * @param    {[type]}   param [description]
 * @return   {[type]}         [description]
 */
export function getPlanBookInitData (data) {
  return request({
    url: '/planBook/V2/getInitData',
    method: 'get',
    params: data
  })
}

/**
 * [calculateProduct description]
 * @Author   Lizh
 * @DateTime 2020-11-12
 * @param    {[type]}   data [description]
 * @return   {[type]}        [description]
 */
export function calculateProduct (data) {
  return request({
    url: '/planBook/V2/calculate',
    method: 'post',
    data
  })
}

