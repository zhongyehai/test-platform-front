import request from '@/utils/request';
import {baseDirTestWork} from "@/apis/base";

function WeeklyConfig(method, data = null, params = null) {
  return request({url: baseDirTestWork + '/weeklyConfig', method: method, data: data, params: params});
}

// 添加周报配置
export function postWeeklyConfig(data) {
  return WeeklyConfig('post', data)
}

// 查找周报配置
export function getWeeklyConfig(params) {
  return WeeklyConfig('get', null, params)
}

// 修改周报配置
export function putWeeklyConfig(data) {
  return WeeklyConfig('put', data)
}

// 删除周报配置
export function deleteWeeklyConfig(data) {
  return WeeklyConfig('delete', data)
}

// 获取周报配置list
export function weeklyConfigList(params) {
  return request({url: baseDirTestWork + '/weeklyConfig/list', method: 'get', params: params});
}


function Weekly(method, data = null, params = null) {
  return request({url: baseDirTestWork + '/weekly', method: method, data: data, params: params});
}

// 添加周报
export function postWeekly(data) {
  return Weekly('post', data)
}

// 查找周报
export function getWeekly(params) {
  return Weekly('get', null, params)
}

// 修改周报
export function putWeekly(data) {
  return Weekly('put', data)
}

// 删除周报
export function deleteWeekly(data) {
  return Weekly('delete', data)
}

// 获取周报list
export function weeklyListData(params) {
  return request({url: baseDirTestWork + '/weekly/list', method: 'get', params: params});
}

// 导出周报
export function downloadWeeklyData(params) {
  return request({url: baseDirTestWork + '/weekly/download', method: 'get', params: params, responseType: 'blob'});
}
