import request from '@/utils/request' // 加载请求配置文件
import { baseDirAssist } from '@/apis/base'

const currentBaseDir = baseDirAssist + '/hit'

function Hit(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 新增问题
export function postHit(data) {
  return Hit('post', data)
}

// 修改问题
export function putHit(data) {
  return Hit('put', data)
}

// 获取问题
export function getHit(params) {
  return Hit('get', null, params)
}

// 删除问题
export function deleteHit(data) {
  return Hit('delete', data)
}

// 获取所有问题列表
export function hitList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 获取所有问题类型
export function getHitTypeList() {
  return request({ url: currentBaseDir + '/type-list', method: 'get' })
}

