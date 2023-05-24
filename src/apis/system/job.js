import request from '@/utils/request'
import { baseDirSystem } from '@/apis/base'

const baseDir = baseDirSystem + '/job'

function Func(method, data = null, params = null) {
  return request({ url: baseDir, method: method, data: data, params: params })
}

// 任务方法列表
export function jobFuncList(data) {
  return request({ url: baseDir + '/func/list', method: 'get', data: data })
}

// 任务列表
export function jobList(data) {
  return request({ url: baseDir + '/list', method: 'get', data: data })
}

// 执行任务
export function jobRun(params) {
  return request({ url: baseDir + '/run', method: 'post', params: params })
}

// 获取任务信息
export function getJob(params) {
  return Func('get', null, params)
}

// 新增任务
export function postJob(data) {
  return Func('post', data)
}

// 删除任务
export function deleteJob(data) {
  return Func('delete', data)
}
