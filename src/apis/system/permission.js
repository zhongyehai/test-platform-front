import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const currentBaseDir = baseDirSystem + '/permission'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 权限类型
export function permissionType(params) {
  return request({ url: currentBaseDir + '/type', method: 'get', params: params })
}

// 权限列表
export function permissionList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 修改权限排序
export function permissionSort(data) {
  return request({ url: currentBaseDir + '/sort', method: 'put', data: data })
}

// 获取权限信息
export function getPermission(params) {
  return Func('get', null, params)
}

// 新增权限
export function postPermission(data) {
  return Func('post', data)
}

// 修改权限
export function putPermission(data) {
  return Func('put', data)
}

// 删除权限
export function deletePermission(data) {
  return Func('delete', data)
}

