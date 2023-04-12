import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const currentBaseDir = baseDirSystem + '/role'

function Func(method, data = null, params = null) {
  return request({ url: currentBaseDir, method: method, data: data, params: params })
}

// 权限列表
export function roleList(params) {
  return request({ url: currentBaseDir + '/list', method: 'get', params: params })
}

// 获取权限信息
export function getRole(params) {
  return Func('get', null, params)
}

// 新增权限
export function postRole(data) {
  return Func('post', data)
}

// 修改权限
export function putRole(data) {
  return Func('put', data)
}

// 删除权限
export function deleteRole(data) {
  return Func('delete', data)
}

