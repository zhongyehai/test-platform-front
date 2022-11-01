import request from '@/utils/request';  //加载请求配置文件
import {baseDirWebUiTest} from "@/apis/base";

let currentBaseDir = baseDirWebUiTest + '/element'
export const uploadElementDir = currentBaseDir + '/upload'

function Func(method, data = null, params = null) {
  return request({url: currentBaseDir, method: method, data: data, params: params});
}

// 添加元素信息
export function postElement(data) {
  return Func('post', data)
}

// 修改元素信息
export function putElement(data) {
  return Func('put', data)
}

// 获取元素信息
export function getElement(params) {
  return Func('get', null, params)
}

// 删除元素信息
export function deleteElement(data) {
  return Func('delete', data)
}

// 指定页面下元素list
export function changeElementById(data) {
  return request({url: currentBaseDir + '/changeById', method: 'put', data: data});
}

// 指定页面下元素list
export function elementList(params) {
  return request({url: currentBaseDir + '/list', method: 'get', params: params});
}

// 修改元素排序
export function elementSort(data) {
  return request({url: currentBaseDir + '/sort', method: 'put', data: data});
}

// 导入元素
export function uploadElement(data) {
  return request({url: currentBaseDir + '/upload', method: 'post', data: data});
}

// 下载导入元素模板
export function downloadElementTemplate() {
  return request({url: currentBaseDir + '/template/download', method: 'get', responseType: 'blob'});
}
