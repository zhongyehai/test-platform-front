import request from '@/utils/request';
import {baseDirApiTest} from "@/apis/base";

function Func(method, data = null, params = null) {
  return request({url: baseDirApiTest + '/task', method: method, data: data, params: params});
}

// 获取任务信息
export function getTask(params) {
  return Func('get', null, params)
}

// 添加任务信息
export function postTask(data) {
  return Func('post', data)
}

// 修改任务信息
export function putTask(data) {
  return Func('put', data)
}

// 删除任务信息
export function deleteTask(data) {
  return Func('delete', data)
}

// 任务列表
export function taskList(params) {
  return request({url: baseDirApiTest + '/task/list', method: 'get', params: params});
}

// 启用任务
export function enableTask(data) {
  return request({url: baseDirApiTest + '/task/status', method: 'post', data: data});
}

// 禁用任务
export function disableTask(data) {
  return request({url: baseDirApiTest + '/task/status', method: 'delete', data: data});
}

// 单次运行定时任务
export function runTask(data) {
  return request({url: baseDirApiTest + '/task/run', method: 'post', data: data});
}

// 复制定时任务
export function copyTask(data) {
  return request({url: baseDirApiTest + '/task/copy', method: 'post', data: data});
}

// 修改定时任务排序
export function taskSort(data) {
  return request({url: baseDirApiTest + '/task/sort', method: 'put', data: data});
}
