import request from '@/utils/request'
import { baseDirConfig } from '@/apis/base' // 加载请求配置文件

const currentBaseDir = baseDirConfig + '/config'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 添加配置
export function postConfig(data) {
  return Func('post', data)
}

// 查找配置
export function getConfig(params) {
  return Func('get', null, params)
}

// 修改配置
export function putConfig(data) {
  return Func('put', data)
}

// 删除配置
export function deleteConfig(data) {
  return Func('delete', data)
}

// 获取配置list
export function configList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 根据配置名获取配置
export function getConfigByCode(params) {
  return request({ url: currentBaseDir + '/by/code', method: 'get', params: params })
}

// 获取跳过条件数据源
export function getSkipIfDataSourceMapping(params) {
  return request({ url: currentBaseDir + '/skip-if', method: 'get', params: params })
}

// 获取定位方式数据源
export function getGetFindElementBy(params) {
  return request({ url: currentBaseDir + '/find-element-by', method: 'get', params: params })
}
