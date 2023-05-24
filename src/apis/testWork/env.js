import request from '@/utils/request'
import { baseDirTestWork } from '@/apis/base' // 加载请求配置文件

const currentBaseDir = baseDirTestWork + '/env'

// 测试账号列表
export function envList(data) {
  return request({ url: currentBaseDir + '/list', method: 'post', data: data })
}

// 测试账号项目列表
export function envBusiness() {
  return request({ url: currentBaseDir + '/business', method: 'get' })
}

// 获取测试账号
export function getEnv(params) {
  return request({ url: currentBaseDir, method: 'get', params: params })
}

// 添加测试账号
export function postEnv(data) {
  return request({ url: currentBaseDir, method: 'post', data: data })
}

// 修改测试账号
export function putEnv(data) {
  return request({ url: currentBaseDir, method: 'put', data: data })
}

// 删除测试账号
export function deleteEnv(data) {
  return request({ url: currentBaseDir, method: 'delete', data: data })
}
