import request from '@/utils/request'
import { baseDirTestWork } from '@/apis/base' // 加载请求配置文件

const currentBaseDir = baseDirTestWork + '/bugTrack'

// bug列表
export function bugList(data) {
  return request({ url: currentBaseDir + '/list', method: 'post', data: data })
}

// 修改bug状态
export function changeBugStatus(data) {
  return request({ url: currentBaseDir + '/status', method: 'put', data: data })
}

// 修改bug是否复盘
export function changeBugReplays(data) {
  return request({ url: currentBaseDir + '/replay', method: 'put', data: data })
}

// 修改bug是否复盘
export function iterationList() {
  return request({ url: currentBaseDir + '/iteration', method: 'post' })
}

// 获取bug
export function getBug(params) {
  return request({ url: currentBaseDir, method: 'get', params: params })
}

// 添加bug
export function postBug(data) {
  return request({ url: currentBaseDir, method: 'post', data: data })
}

// 修改bug
export function putBug(data) {
  return request({ url: currentBaseDir, method: 'put', data: data })
}

// 删除bug
export function deleteBug(data) {
  return request({ url: currentBaseDir, method: 'delete', data: data })
}
