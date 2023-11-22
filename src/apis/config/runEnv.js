import request from '@/utils/request'
import { baseDirConfig } from '@/apis/base' // 加载请求配置类型文件

const currentBaseDir = baseDirConfig + '/run-env'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 添加配置类型
export function postRunEnv(data) {
  return Func('post', data)
}

// 查找配置类型
export function getRunEnv(params) {
  return Func('get', null, params)
}

// 修改配置类型
export function putRunEnv(data) {
  return Func('put', data)
}

// 删除配置类型
export function deleteRunEnv(data) {
  return Func('delete', data)
}

// 获取配置类型list
export function runEnvGroupList(params) {
  return request({ url: currentBaseDir + '/group', method: 'get', params: params })
}

// 获取配置类型list
export function runEnvList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 获取配置类型list
export function runEnvSort(data) {
  return request({ url: currentBaseDir + '/sort', method: 'put', data: data })
}

// 批量修改环境与业务线的绑定关系
export function runEnvToBusiness(data) {
  return request({ url: currentBaseDir + '/business', method: 'put', data: data })
}
