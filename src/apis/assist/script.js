import request from '@/utils/request' // 加载请求配置文件
import { baseDirAssist } from '@/apis/base'

const currentBaseDir = baseDirAssist + '/script'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 新增脚本
export function postScript(data) {
  return Func('post', data)
}

// 修改脚本
export function putScript(data) {
  return Func('put', data)
}

// 查询脚本, 获取代码
export function getScript(params) {
  return Func('get', null, params)
}

// 删除脚本
export function deleteScript(data) {
  return Func('delete', data)
}

// 获取所有脚本名
export function scriptList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 调试脚本
export function debugScript(data) {
  return request({ url: currentBaseDir + '/debug', method: 'POST', data: data })
}

// 复制
export function copyScript(data) {
  return request({ url: currentBaseDir + '/copy', method: 'post', data: data })
}

// 修改排序
export function scriptSort(data) {
  return request({ url: currentBaseDir + '/sort', method: 'put', data: data })
}
