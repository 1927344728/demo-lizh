import request from '@/utils/request'

/**
 * 获取投保页初始化数据
 * @Author   Lizh
 * @DateTime 2019-12-10
 * @param    {[type]}   param [description]
 * @return   {[type]}         [description]
 */
export function getPlanBookInitData (params) {
  return request({
    url: '/planBook/V2/getInitData',
    method: 'get',
    params
  })
}
