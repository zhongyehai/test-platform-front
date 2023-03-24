import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base' // 加载请求业务线文件

const currentBaseDir = baseDirSystem + '/business'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 添加业务线
export function postBusiness(data) {
  return Func('post', data)
}

// 查找业务线
export function getBusiness(params) {
  return Func('get', null, params)
}

// 修改业务线
export function putBusiness(data) {
  return Func('put', data)
}

// 删除业务线
export function deleteBusiness(data) {
  return Func('delete', data)
}

// 获取业务线list
export function businessList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}
